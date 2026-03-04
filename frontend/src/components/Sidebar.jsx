import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { LogOut } from 'lucide-react';

const Sidebar = ({ onWorkspaceSelect }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchWorkspaces = async () => {
      try {
        setError('');
        setLoading(true);
        const res = await api.get('/workspaces');
        if (active) setWorkspaces(res.data || []);
      } catch (err) {
        if (active) setError('Failed to load workspaces');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWorkspaces();
    return () => { active = false; };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      const res = await api.post('/workspaces', { name: newName.trim() });
      setWorkspaces((prev) => [res.data, ...prev]);
      setNewName('');
      setIsModalOpen(false);
      navigate(`/workspace/${res.data.id}`);
      onWorkspaceSelect?.();
    } catch (err) {
      setError('Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col bg-slate-900/50 text-slate-50">
      {/* Brand header */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <span className="text-xl font-bold tracking-tight text-indigo-400">TeamSync</span>
      </div>

      {/* Workspace list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {loading && (
          <p className="px-4 text-xs text-slate-500 animate-pulse">Loading…</p>
        )}
        {!loading && error && (
          <p className="px-4 text-xs text-red-400">{error}</p>
        )}
        {!loading && !error && workspaces.map((ws) => (
          <NavLink
            key={ws.id}
            to={`/workspace/${ws.id}`}
            onClick={() => onWorkspaceSelect?.()}
            className={({ isActive }) =>
              `mx-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-800 text-xs font-bold uppercase">
              {ws.name?.charAt(0)}
            </div>
            <span className="truncate">{ws.name}</span>
          </NavLink>
        ))}

        {/* Create new workspace button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mx-3 mt-1 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-dashed border-slate-700 text-slate-600">
            +
          </div>
          <span>New Workspace</span>
        </button>
      </div>

      {/* User profile / logout */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Create workspace modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">New Workspace</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-white outline-none focus:border-indigo-600 transition-all"
                placeholder="e.g. My Team"
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
                  disabled={creating || !newName.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;