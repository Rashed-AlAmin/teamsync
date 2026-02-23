import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const MemberList = ({ workspaceId }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  const loadMembers = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(res.data || []);
    } catch (err) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMembers([]);
    setInviteMessage('');
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const currentMember = members.find((m) => m.uid === user?.uid);
  const isAdmin = currentMember?.role === 'admin';

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setInviteLoading(true);
      setInviteMessage('');
      const res = await api.post(`/workspaces/${workspaceId}/invite`, {
        email: inviteEmail.trim(),
      });
      setInviteMessage(res.data?.message || 'User invited successfully');
      setInviteEmail('');
      await loadMembers();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 403
          ? 'You must be an admin to invite members'
          : 'Failed to invite user');
      setInviteMessage(msg);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-l border-slate-800 bg-slate-950/90">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Members
        </span>
        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setInviteOpen(true);
              setInviteMessage('');
            }}
            className="rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium hover:bg-slate-700"
          >
            Invite
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {loading && (
          <div className="text-xs text-slate-400">Loading members...</div>
        )}
        {!loading && error && (
          <div className="text-xs text-red-400">{error}</div>
        )}
        {!loading && !error && members.length === 0 && (
          <div className="text-xs text-slate-500">
            No members yet.
          </div>
        )}
        {!loading &&
          !error &&
          members.map((m) => (
            <div
              key={m.uid}
              className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-slate-900"
            >
              <span className="truncate text-slate-100">
                {m.email || m.uid}
              </span>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  m.role === 'admin'
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {m.role === 'admin' ? 'Admin' : 'Member'}
              </span>
            </div>
          ))}
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold mb-3">Invite Member</h3>
            {inviteMessage && (
              <div className="mb-3 rounded-md bg-slate-800 px-3 py-2 text-xs text-slate-100">
                {inviteMessage}
              </div>
            )}
            <form onSubmit={handleInvite} className="space-y-3">
              <div>
                <label
                  htmlFor="invite-email"
                  className="block text-xs mb-1 text-slate-300"
                >
                  Email address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="user@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setInviteOpen(false);
                    setInviteMessage('');
                    setInviteEmail('');
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {inviteLoading ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;

