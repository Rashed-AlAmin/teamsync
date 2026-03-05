import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const MemberList = ({ workspaceId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'tasks'

  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState('');

  const loadMembers = async () => {
    if (!workspaceId) return;
    try {
      setMembersLoading(true);
      setMembersError('');
      const res = await api.get(`/workspaces/${workspaceId}/members`);
      setMembers(res.data || []);
    } catch {
      setMembersError('Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!workspaceId) return;
    try {
      setTasksLoading(true);
      setTasksError('');
      const res = await api.get(`/workspaces/${workspaceId}/tasks`);
      setTasks(res.data || []);
    } catch {
      setTasksError('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    setMembers([]);
    setTasks([]);
    setInviteMessage('');
    loadMembers();
    loadTasks();
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

  const memberMap = useMemo(() => {
    const map = new Map();
    members.forEach((m) => {
      map.set(m.uid, m);
    });
    return map;
  }, [members]);

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)),
    );

    try {
      await api.patch(
        `/workspaces/${workspaceId}/tasks/${task.id}`,
        { status: nextStatus },
      );
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t,
        ),
      );
    }
  };

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskError, setTaskError] = useState('');

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskAssignee) return;
    try {
      setTaskSubmitting(true);
      setTaskError('');
      const res = await api.post(`/workspaces/${workspaceId}/tasks`, {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        assignedTo: taskAssignee,
        status: 'todo',
      });
      setTasks((prev) => [...prev, res.data]);
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssignee('');
      setTaskModalOpen(false);
    } catch {
      setTaskError('Failed to create task');
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-1 min-w-0 flex-col border-l border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-slate-800 text-slate-50'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Members
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-slate-800 text-slate-50'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Tasks
          </button>
        </div>
        {activeTab === 'members' && isAdmin && (
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
        {activeTab === 'tasks' && (
          <button
            type="button"
            onClick={() => setTaskModalOpen(true)}
            className="rounded-md bg-slate-800 px-2 py-1 text-[11px] font-medium hover:bg-slate-700"
          >
            +
          </button>
        )}
      </div>

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {membersLoading && (
            <div className="text-xs text-slate-400">Loading members...</div>
          )}
          {!membersLoading && membersError && (
            <div className="text-xs text-red-400">{membersError}</div>
          )}
          {!membersLoading && !membersError && members.length === 0 && (
            <div className="text-xs text-slate-500">
              No members yet.
            </div>
          )}
          {!membersLoading &&
            !membersError &&
            members.map((m) => (
              <div
                key={m.uid}
                className="flex items-center justify-between rounded-md px-2 py-1 text-xs hover:bg-indigo-600/20 transition-colors"
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
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {tasksLoading && (
            <div className="text-xs text-slate-400">Loading tasks...</div>
          )}
          {!tasksLoading && tasksError && (
            <div className="text-xs text-red-400">{tasksError}</div>
          )}
          {!tasksLoading && !tasksError && tasks.length === 0 && (
            <div className="text-xs text-slate-500">
              No tasks yet. Create one.
            </div>
          )}
          {!tasksLoading &&
            !tasksError &&
            tasks.map((task) => {
              const assigned = memberMap.get(task.assignedTo);
              return (
                <label
                  key={task.id}
                  className="flex items-start gap-2 rounded-md px-2 py-1 text-xs hover:bg-indigo-600/20 transition-colors cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 h-3 w-3 rounded border-slate-600 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`truncate ${
                        task.status === 'done'
                          ? 'line-through text-slate-500'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.description && (
                      <div className="text-[11px] text-slate-400 truncate">
                        {task.description}
                      </div>
                    )}
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      Assigned to:{' '}
                      {assigned?.email || assigned?.uid || 'Unassigned'}
                    </div>
                  </div>
                </label>
              );
            })}
        </div>
      )}

       {/* Invite modal */}
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

      {/* Create Task modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
            <h3 className="text-sm font-semibold mb-3">Create Task</h3>
            {taskError && (
              <div className="mb-3 rounded-md bg-red-900/40 border border-red-700 px-3 py-2 text-xs text-red-100">
                {taskError}
              </div>
            )}
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label
                  htmlFor="task-title"
                  className="block text-xs mb-1 text-slate-300"
                >
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="task-desc"
                  className="block text-xs mb-1 text-slate-300"
                >
                  Description
                </label>
                <textarea
                  id="task-desc"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
              <div>
                <label
                  htmlFor="task-assignee"
                  className="block text-xs mb-1 text-slate-300"
                >
                  Assign to
                </label>
                <select
                  id="task-assignee"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m.uid} value={m.uid}>
                      {m.email || m.uid}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTaskModalOpen(false);
                    setTaskError('');
                    setTaskTitle('');
                    setTaskDescription('');
                    setTaskAssignee('');
                  }}
                  className="rounded-md px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={taskSubmitting || !taskTitle.trim() || !taskAssignee}
                  className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {taskSubmitting ? 'Creating...' : 'Create Task'}
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