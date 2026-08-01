import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Eye, Clock, Lock, Sparkles } from 'lucide-react';
import { API_BASE, getOwnerToken, getAuthToken } from '../api';

interface ListPastesProps {
  mode: 'mine' | 'public';
  onSelectPaste: (slug: string) => void;
}

export const ListPastes: React.FC<ListPastesProps> = ({ mode, onSelectPaste }) => {
  const [pastes, setPastes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPastes = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/pastes`;
      if (mode === 'mine') {
        const ownerToken = getOwnerToken();
        url = `${API_BASE}/pastes/mine?ownerToken=${ownerToken}`;
      }

      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      const data = await res.json();
      setPastes(data.pastes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastes();
  }, [mode]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-cyan-500/5 rounded-2xl animate-pulse border border-cyan-500/10"></div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <h2 className="text-2xl font-black text-white flex items-center space-x-2">
          <span>{mode === 'mine' ? 'My Snippets' : 'Recent Public Feed'}</span>
          <Sparkles className="w-5 h-5 text-cyan-400" />
        </h2>
        <span className="text-xs text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-400/30 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          {pastes.length} pastes found
        </span>
      </div>

      {pastes.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center space-y-3 border border-cyan-500/20">
          <Code2 className="w-12 h-12 text-cyan-400/50 mx-auto animate-pulse" />
          <p className="text-gray-200 font-semibold text-base">No pastes found</p>
          <p className="text-xs text-gray-400">
            {mode === 'mine' ? "You haven't created any pastes in this session." : 'No public pastes available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pastes.map((p) => (
            <div
              key={p.slug}
              onClick={() => onSelectPaste(p.slug)}
              className="glass-panel glass-panel-hover p-6 rounded-2xl border border-cyan-500/20 cursor-pointer group space-y-4"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 text-base">
                  {p.title || 'Untitled Paste'}
                </h3>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-400/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                  {p.language}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-cyan-500/15">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5 text-cyan-300">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{p.views} views</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>

                {(p.visibility === 'PRIVATE' || p.hasPassword) && (
                  <Lock className="w-4 h-4 text-fuchsia-400 shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
