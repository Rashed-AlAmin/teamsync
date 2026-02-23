import { useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';

const ChannelList = ({ workspaceId, channels, loading, error, onChannelCreated }) => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setCreating(true);
      setLocalError('');
      const res = await api.post(`/workspaces/${workspaceId}/channels`, {
        name: name.trim(),
      });
      onChannelCreated?.(res.data);
      setName('');
      setIsModalOpen(false);
      navigate(`/workspace/${workspaceId}/channel/${res.data.id}`);
    } catch (err) {
      setLocalError('Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-950/90">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Channels
        </span>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-xs font-bold hover:bg-slate-700"
          aria-label="Create channel"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading && (
          <div className="px-2 py-1 text-xs text-slate-400">Loading channels...</div>
        )}
        {!loading && error && (
          <div className="px-2 py-1 text-xs text-red-400">{error}</div>
        )}
        {!loading && !error && channels.length === 0 && (
          <div className="px-2 py-1 text-xs text-slate-500">
            No channels yet. Create the first one.
          </div>
        )}

        <nav className="mt-1 space-y-1">
          {channels.map((channel) => (
            <NavLink
              key={channel.id}
              to={`/workspace/${workspaceId}/channel/${channel.id}`}
              className={({ isActive }) =>
                [
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive || channel.id === channelId
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50',
                ].join(' ')
              }
            >
              <span className="text-slate-500">#</span>
              <span className="truncate">{channel.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold mb-3">Create Channel</h3>
            {localError && (
              <div className="mb-3 rounded-md bg-red-900/40 border border-red-700 px-3 py-2 text-xs text-red-100">
                {localError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label htmlFor="channel-name" className="block text-xs mb-1 text-slate-300">
                  Channel name
                </label>
                <input
                  id="channel-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="general, announcements..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setLocalError('');
                    setName('');
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
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

