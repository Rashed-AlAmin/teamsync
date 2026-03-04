import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Plus, Hash } from 'lucide-react';

const ChannelList = ({ workspaceId, channels, loading, error, onChannelCreated, onSelect }) => {
  const { channelId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      const res = await api.post(`/workspaces/${workspaceId}/channels`, {
        name: name.trim(),
      });
      onChannelCreated?.(res.data);
      setName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-900/30">
      {/* Header */}
      <div className="flex h-12 items-center justify-between px-4 border-b border-slate-800/60">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Channels
        </span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          title="New channel"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {loading ? (
          <div className="px-3 py-2 text-xs text-slate-500 animate-pulse">Loading channels…</div>
        ) : error ? (
          <div className="px-3 py-2 text-xs text-red-400">{error}</div>
        ) : channels.length === 0 ? (
          <div className="px-3 py-2 text-xs text-slate-600">No channels yet.</div>
        ) : (
          channels.map((channel) => (
            <NavLink
              key={channel.id}
              to={`/workspace/${workspaceId}/channel/${channel.id}`}
              onClick={() => onSelect?.()}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`
              }
            >
              {/* Visible # icon with background */}
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-700/70 text-slate-400">
                <Hash size={11} />
              </span>
              <span className="truncate">{channel.name}</span>
            </NavLink>
          ))
        )}
      </div>

      {/* Create Channel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create Channel</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white outline-none focus:border-indigo-600 transition-all"
                placeholder="e.g. general"
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelList;