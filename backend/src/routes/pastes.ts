import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { optionalAuth, AuthRequest } from '../auth.js';

const router = Router();

const createPasteSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  language: z.string().default('plaintext'),
  expiration: z.enum(['never', '10m', '1h', '1d', '1w', '1m']).default('never'),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).default('PUBLIC'),
  password: z.string().optional(),
  burnAfterRead: z.boolean().default(false),
  ownerToken: z.string().optional(),
});

function calculateExpiration(expStr: string): Date | null {
  if (expStr === 'never') return null;
  const now = new Date();
  switch (expStr) {
    case '10m': return new Date(now.getTime() + 10 * 60 * 1000);
    case '1h': return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '1w': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '1m': return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default: return null;
  }
}

// 1. Create Paste
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const data = createPasteSchema.parse(req.body);
    const slug = nanoid(8);
    const expiresAt = calculateExpiration(data.expiration);

    let passwordHash: string | undefined = undefined;
    if (data.password && data.password.trim() !== '') {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    const paste = await prisma.paste.create({
      data: {
        slug,
        title: data.title || null,
        content: data.content,
        language: data.language,
        visibility: data.visibility,
        passwordHash: passwordHash || null,
        burnAfterRead: data.burnAfterRead,
        expiresAt,
        ownerToken: data.ownerToken || null,
        userId: req.user ? req.user.id : null,
      },
    });

    return res.status(201).json({
      slug: paste.slug,
      title: paste.title,
      language: paste.language,
      visibility: paste.visibility,
      hasPassword: !!paste.passwordHash,
      burnAfterRead: paste.burnAfterRead,
      expiresAt: paste.expiresAt,
      createdAt: paste.createdAt,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    return res.status(500).json({ error: 'Failed to create paste' });
  }
});

// 2. List recent public pastes
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const now = new Date();
    const pastes = await prisma.paste.findMany({
      where: {
        visibility: 'PUBLIC',
        passwordHash: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } },
        ],
      },
      select: {
        slug: true,
        title: true,
        language: true,
        views: true,
        createdAt: true,
        expiresAt: true,
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return res.json({ page, limit, pastes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch public pastes' });
  }
});

// 3. List owner/my pastes
router.get('/mine', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const ownerToken = req.query.ownerToken as string;
    const userId = req.user?.id;

    if (!ownerToken && !userId) {
      return res.json({ pastes: [] });
    }

    const now = new Date();
    const pastes = await prisma.paste.findMany({
      where: {
        OR: [
          userId ? { userId } : {},
          ownerToken ? { ownerToken } : {},
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      },
      select: {
        slug: true,
        title: true,
        language: true,
        visibility: true,
        views: true,
        burnAfterRead: true,
        createdAt: true,
        expiresAt: true,
        passwordHash: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = pastes.map(p => ({
      ...p,
      hasPassword: !!p.passwordHash,
      passwordHash: undefined,
    }));

    return res.json({ pastes: formatted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user pastes' });
  }
});

// 4. Retrieve Paste by Slug
router.get('/:slug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const password = req.query.password as string;
    const clientToken = (req.headers['x-client-device-id'] as string) || req.ip || 'unknown';

    const paste = await prisma.paste.findUnique({
      where: { slug },
      include: { user: { select: { username: true } } },
    });

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    // Check expiration
    if (paste.expiresAt && paste.expiresAt <= new Date()) {
      await prisma.paste.delete({ where: { id: paste.id } });
      return res.status(404).json({ error: 'Paste expired and deleted' });
    }

    // Check password protection
    if (paste.passwordHash) {
      if (!password) {
        return res.status(401).json({ error: 'Password required', isPasswordProtected: true });
      }
      const valid = await bcrypt.compare(password, paste.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Incorrect password', isPasswordProtected: true });
      }
    }

    // Single view count logic: Only increment if this device hasn't viewed this paste before
    let currentViews = paste.views;
    const viewHeader = req.headers['x-viewed-pastes'] as string;
    const viewedPastes: string[] = viewHeader ? JSON.parse(viewHeader) : [];

    if (!viewedPastes.includes(paste.id)) {
      const updated = await prisma.paste.update({
        where: { id: paste.id },
        data: { views: { increment: 1 } },
      });
      currentViews = updated.views;
    }

    // Handle burn after read
    if (paste.burnAfterRead) {
      await prisma.paste.delete({ where: { id: paste.id } });
    }

    return res.json({
      id: paste.id,
      slug: paste.slug,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      visibility: paste.visibility,
      views: currentViews,
      burnAfterRead: paste.burnAfterRead,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      author: paste.user ? paste.user.username : 'Anonymous',
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve paste' });
  }
});

// 5. Retrieve Raw Content
router.get('/:slug/raw', async (req, res) => {
  try {
    const { slug } = req.params;
    const password = req.query.password as string;

    const paste = await prisma.paste.findUnique({ where: { slug } });

    if (!paste) {
      return res.status(404).send('Paste not found');
    }

    if (paste.expiresAt && paste.expiresAt <= new Date()) {
      await prisma.paste.delete({ where: { id: paste.id } });
      return res.status(404).send('Paste expired');
    }

    if (paste.passwordHash) {
      if (!password) {
        return res.status(401).send('Password required');
      }
      const valid = await bcrypt.compare(password, paste.passwordHash);
      if (!valid) {
        return res.status(401).send('Incorrect password');
      }
    }

    if (paste.burnAfterRead) {
      await prisma.paste.delete({ where: { id: paste.id } });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.send(paste.content);
  } catch (err) {
    return res.status(500).send('Internal Server Error');
  }
});

// 6. Delete Paste
router.delete('/:slug', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;
    const ownerToken = (req.query.ownerToken as string) || req.body?.ownerToken;

    const paste = await prisma.paste.findUnique({ where: { slug } });

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const isUserOwner = req.user && paste.userId === req.user.id;
    const isTokenOwner = ownerToken && paste.ownerToken === ownerToken;

    if (!isUserOwner && !isTokenOwner) {
      return res.status(403).json({ error: 'You do not have permission to delete this paste' });
    }

    await prisma.paste.delete({ where: { id: paste.id } });
    return res.json({ message: 'Paste deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete paste' });
  }
});

export const pasteRouter = router;
