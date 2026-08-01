import { Command } from 'commander';
import fetch from 'node-fetch';

const program = new Command();

const API_BASE = process.env.PASTEVAULT_API || 'http://localhost:4000/api';

program
  .name('pastevault')
  .description('Official CLI Client for PasteVault Code & Text Snippet Platform')
  .version('1.0.0');

// Create Paste Command
program
  .command('create')
  .description('Create a new code paste snippet')
  .requiredOption('-c, --content <content>', 'Content of the code snippet')
  .option('-t, --title <title>', 'Title of the paste', 'Untitled Paste')
  .option('-l, --language <language>', 'Programming language', 'plaintext')
  .option('-e, --expiration <expiration>', 'Expiration time (never, 10m, 1h, 1d, 1w, 1m)', 'never')
  .option('-v, --visibility <visibility>', 'Visibility (PUBLIC, UNLISTED, PRIVATE)', 'PUBLIC')
  .option('-p, --password <password>', 'Optional protection password')
  .option('-b, --burn', 'Burn after reading once', false)
  .action(async (options) => {
    try {
      const res = await fetch(`${API_BASE}/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: options.title,
          content: options.content,
          language: options.language,
          expiration: options.expiration,
          visibility: options.visibility,
          password: options.password || undefined,
          burnAfterRead: options.burn,
          ownerToken: 'cli_' + Math.random().toString(36).substring(2, 10),
        }),
      });

      const data: any = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      console.log('✅ Paste Created Successfully!');
      console.log(`📌 Title: ${data.title}`);
      console.log(`🔗 URL: http://localhost:5173/p/${data.slug}`);
      console.log(`⚡ Raw URL: ${API_BASE}/pastes/${data.slug}/raw`);
    } catch (err: any) {
      console.error('❌ Error:', err.message);
    }
  });

// Get / Retrieve Paste Command
program
  .command('get <slug>')
  .description('Retrieve and view content of a paste by slug')
  .option('-p, --password <password>', 'Password if paste is protected')
  .action(async (slug, options) => {
    try {
      const url = new URL(`${API_BASE}/pastes/${slug}`);
      if (options.password) url.searchParams.append('password', options.password);

      const res = await fetch(url.toString());
      const data: any = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to retrieve paste');
      }

      console.log(`\n========================================`);
      console.log(`📌 Title: ${data.title || 'Untitled'} (${data.language})`);
      console.log(`👤 Author: ${data.author}`);
      console.log(`👁️  Views: ${data.views}`);
      console.log(`========================================\n`);
      console.log(data.content);
      console.log(`\n========================================\n`);
    } catch (err: any) {
      console.error('❌ Error:', err.message);
    }
  });

// List Public Pastes Command
program
  .command('list')
  .description('List recent public pastes from Explore Feed')
  .action(async () => {
    try {
      const res = await fetch(`${API_BASE}/pastes`);
      const data: any = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch public pastes');
      }

      console.log('\n🌐 Recent Public Pastes:\n');
      data.pastes.forEach((p: any) => {
        console.log(`• [${p.slug}] ${p.title || 'Untitled'} (${p.language}) - ${p.views} views`);
      });
      console.log('');
    } catch (err: any) {
      console.error('❌ Error:', err.message);
    }
  });

program.parse(process.argv);
