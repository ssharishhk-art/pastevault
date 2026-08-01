import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Download, Link, Lock, Eye, Trash2, Flame, AlertTriangle, Share2, X } from 'lucide-react';
import { API_BASE, getOwnerToken, getAuthToken } from '../api';

interface ViewPasteProps {
  slug: string;
  onDeleted?: () => void;
}

export const ViewPaste: React.FC<ViewPasteProps> = ({ slug, onDeleted }) => {
  const [paste, setPaste] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchPaste = async (pass?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${window.location.origin}${API_BASE}/pastes/${slug}`);
      if (pass) url.searchParams.append('password', pass);

      // Get viewed pastes from client localStorage
      const viewedKey = 'pastebin_viewed_slugs';
      let viewed: string[] = [];
      try {
        viewed = JSON.parse(localStorage.getItem(viewedKey) || '[]');
      } catch (e) {
        viewed = [];
      }

      const headers: Record<string, string> = {
        'x-viewed-pastes': JSON.stringify(viewed),
      };

      const res = await fetch(url.toString(), { headers });
      const data = await res.json();

      if (res.status === 401 && data.isPasswordProtected) {
        setPasswordRequired(true);
        if (pass) setError('Incorrect password');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load paste');
      }

      setPasswordRequired(false);
      setPaste(data);

      // Save paste ID to local storage so future reloads on this device don't increment views
      if (data.id && !viewed.includes(data.id)) {
        viewed.push(data.id);
        localStorage.setItem(viewedKey, JSON.stringify(viewed));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaste();
  }, [slug]);

  const handleCopyCode = () => {
    if (paste?.content) {
      navigator.clipboard.writeText(paste.content);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    if (!paste) return;
    const blob = new Blob([paste.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paste.slug || 'paste'}.${paste.language || 'txt'}`;
    a.click();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const ownerToken = getOwnerToken();
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/pastes/${slug}?ownerToken=${ownerToken}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }

      if (onDeleted) onDeleted();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const shareUrl = `${window.location.origin}/p/${slug}`;
  const shareText = `Check out this code paste "${paste?.title || 'Snippet'}" on PasteVault:`;

  const shareToWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  const shareToInstagram = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Paste link copied to clipboard! Open Instagram to share in stories or direct messages.');
    window.open('https://instagram.com', '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-4 animate-pulse">
        <div className="h-10 bg-cyan-500/10 rounded-xl w-1/3 border border-cyan-500/20"></div>
        <div className="h-96 bg-cyan-500/5 rounded-2xl border border-cyan-500/10"></div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="glass-panel p-6 rounded-2xl border border-fuchsia-500/40 text-center space-y-4 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-400/40 text-fuchsia-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(217,70,239,0.4)]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Protected Paste</h2>
          <p className="text-sm text-gray-400">Enter password to view snippet content.</p>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <form onSubmit={(e) => { e.preventDefault(); fetchPaste(password); }} className="space-y-3">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-input border border-cyan-500/30 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-black font-extrabold text-sm transition-all shadow-[0_0_15px_rgba(217,70,239,0.4)]"
            >
              Unlock Paste
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !paste) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-3">
        <h2 className="text-2xl font-bold text-red-400">Paste Unavailable</h2>
        <p className="text-gray-400 text-sm">{error || 'This paste does not exist or has expired.'}</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-6"
    >
      {/* Title and Metadata */}
      <div className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-cyan-500/30 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
        <div>
          <h1 className="text-2xl font-extrabold text-white">{paste.title || 'Untitled Paste'}</h1>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
            <span className="text-cyan-400 font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">{paste.language}</span>
            <span>By <strong className="text-gray-200">{paste.author}</strong></span>
            <span className="flex items-center space-x-1 text-cyan-300">
              <Eye className="w-3.5 h-3.5" />
              <span>{paste.views} views</span>
            </span>
            {paste.burnAfterRead && (
              <span className="text-pink-400 flex items-center space-x-1 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Burn after reading</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Share Button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-black text-sm font-extrabold flex items-center space-x-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* Copy Code Button */}
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-sm font-semibold text-cyan-300 flex items-center space-x-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
          >
            {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-400/40 text-sm font-semibold text-fuchsia-300 flex items-center space-x-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(217,70,239,0.2)]"
          >
            {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Link className="w-4 h-4 text-fuchsia-400" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-cyan-500/20 text-sm font-medium text-gray-300 flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-4 h-4 text-gray-400" />
            <span>Download</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
            title="Delete Paste"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Glassmorphism Monaco Code Viewer */}
      <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl backdrop-saturate-200 bg-white/5">
        <div className="relative z-10">
          <Editor
            height="500px"
            theme="vs-dark"
            language={paste.language === 'plaintext' ? 'text' : paste.language}
            value={paste.content}
            options={{
              readOnly: true,
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: false,
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                alwaysConsumeMouseWheel: false,
              },
              mouseWheelScrollSensitivity: 1,
              padding: { top: 14 },
            }}
          />
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-cyan-500/40 text-center space-y-5 shadow-[0_0_40px_rgba(0,240,255,0.3)] relative"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <Share2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">Share Paste</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Choose a platform to share this snippet link
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {/* WhatsApp Share Button */}
                <button
                  onClick={shareToWhatsApp}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm flex items-center justify-center space-x-2.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Share on WhatsApp</span>
                </button>

                {/* Instagram Share Button */}
                <button
                  onClick={shareToInstagram}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 text-white font-extrabold text-sm flex items-center justify-center space-x-2.5 shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all hover:scale-[1.02]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Share on Instagram</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Delete */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-red-500/40 text-center space-y-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">Delete Paste?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Are you sure you want to delete this paste? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-bg-card hover:bg-bg-cardHover border border-cyan-500/20 text-sm font-medium text-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
