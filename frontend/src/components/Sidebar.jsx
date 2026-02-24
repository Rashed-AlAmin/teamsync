import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Sidebar = () => {
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
    } catch (err) {
      setError('Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  return (
    // FIX: Changed w-64 to w-full max-w-[240px] to allow flex-shrink
    <aside className="flex h-screen w-full max-w-[240px] flex-col border-r border-slate-800 bg-slate-950/95 text-slate-50 shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        {/* FIX: Added truncate to ensure the logo/name doesn't break the layout */}
        <span className="text-sm font-semibold tracking-tight truncate mr-2">TeamSync</span>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 font-bold hover:bg-indigo-500"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        <h2 className="px-2 text-xs font-semibold uppercase text-slate-400 mb-2">Workspaces</h2>
        {loading ? (
          <div className="px-2 text-xs text-slate-400">Loading...</div>
        ) : (
          <nav className="space-y-1">
            {workspaces.map((ws) => (
              <NavLink
                key={ws.id}
                to={`/workspace/${ws.id}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/70'
                  }`
                }
              >
                <span className="h-6 w-6 shrink-0 flex items-center justify-center rounded bg-slate-800 text-[10px] uppercase">
                  {ws.name?.charAt(0)}
                </span>
                <span className="truncate">{ws.name}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      <div className="border-t border-slate-800 p-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 truncate flex-1">
          {user?.displayName || user?.email}
        </span>
        <button onClick={logout} className="text-[10px] border border-slate-700 px-2 py-1 rounded hover:bg-slate-800 shrink-0">
          Logout
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-lg font-bold mb-4">New Workspace</h3>
            <form onSubmit={handleCreate}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded mb-4 outline-none focus:border-indigo-600"
                placeholder="Workspace Name"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="bg-indigo-600 px-4 py-2 text-sm rounded hover:bg-indigo-500 transition-colors">{creating ? '...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;