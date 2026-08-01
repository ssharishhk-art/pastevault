import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Lock, Flame, Send, Sparkles } from 'lucide-react';
import { API_BASE, getOwnerToken, getAuthToken } from '../api';
import GlitchText from './GlitchText';

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java',
  'cpp', 'c', 'csharp', 'go', 'rust', 'php', 'ruby', 'kotlin',
  'swift', 'scala', 'html', 'css', 'scss', 'json', 'yaml',
  'sql', 'graphql', 'markdown', 'shell', 'powershell', 'dockerfile',
  'r', 'dart', 'lua', 'perl'
];

interface CreatePasteProps {
  onSuccess: (slug: string) => void;
}

export const CreatePaste: React.FC<CreatePasteProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [expiration, setExpiration] = useState('never');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [password, setPassword] = useState('');
  const [burnAfterRead, setBurnAfterRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Content cannot be empty');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/pastes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          content,
          language,
          expiration,
          visibility,
          password: password || undefined,
          burnAfterRead,
          ownerToken: getOwnerToken(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      onSuccess(data.slug);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto py-6 px-4 sm:px-6"
    >
      {/* Hero Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Paste • Share • Retrieve</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center space-x-3">
          <span>Share Code</span>
          <GlitchText speed={1} enableShadows enableOnHover={false}>
            Instantly
          </GlitchText>
        </h1>
        
        <p className="text-cyan-100 max-w-xl mx-auto text-xs sm:text-sm font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          Create, manage, and share code or text snippets securely with optional privacy and expiration settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm font-bold shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            {error}
          </div>
        )}

        {/* Top Controls */}
        <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-cyan-400/40">
          <input
            type="text"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[220px] bg-bg-input border border-cyan-400/30 rounded-xl px-4 py-2.5 text-white placeholder-gray-300 font-medium focus:outline-none focus:border-cyan-300 focus:shadow-[0_0_15px_rgba(0,240,255,0.4)] text-sm transition-all"
          />

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-bg-input border border-cyan-400/30 text-cyan-200 font-bold rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-300 capitalize font-mono cursor-pointer"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            {/* Expiration */}
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              className="bg-bg-input border border-cyan-400/30 text-white font-semibold rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-300 cursor-pointer"
            >
              <option value="never">Never Expire</option>
              <option value="10m">10 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>

            {/* Visibility */}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-bg-input border border-cyan-400/30 text-white font-semibold rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="PUBLIC">Public</option>
              <option value="UNLISTED">Unlisted</option>
              <option value="PRIVATE">Password Protected</option>
            </select>
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center gap-6 glass-panel p-3.5 rounded-2xl border border-cyan-400/30">
          {visibility === 'PRIVATE' && (
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-300" />
              <input
                type="password"
                placeholder="Set protection password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-bg-input border border-cyan-400/40 rounded-xl px-3.5 py-1.5 text-sm text-white placeholder-gray-300 font-medium focus:outline-none focus:border-cyan-300"
              />
            </div>
          )}

          <label className="flex items-center space-x-2 text-sm text-white font-bold cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={burnAfterRead}
              onChange={(e) => setBurnAfterRead(e.target.checked)}
              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
            />
            <Flame className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
            <span className="group-hover:text-cyan-200 transition-colors">Delete after first view</span>
          </label>
        </div>

        {/* Helper Text Above Editor */}
        <div className="text-xs text-white font-bold px-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          Paste your code or text below.
        </div>

        {/* Clean Glassmorphism Monaco Editor Container */}
        <div className="relative rounded-3xl overflow-hidden border border-cyan-400/40 glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl backdrop-saturate-200 bg-white/5">
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border-b border-white/15 px-5 py-2.5 flex items-center justify-between text-xs text-gray-200">
            <span className="font-mono text-cyan-300 font-extrabold flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff]"></span>
              <span className="capitalize">{language}</span>
            </span>
          </div>
          
          <div className="relative z-10">
            <Editor
              height="400px"
              theme="vs-dark"
              language={language === 'plaintext' ? 'text' : language}
              value={content}
              onChange={(val) => setContent(val || '')}
              options={{
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

        {/* Primary Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="neon-button text-black font-extrabold px-8 py-3.5 rounded-xl text-sm shadow-xl flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Creating...</span>
            ) : (
              <>
                <span>Create Paste</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
