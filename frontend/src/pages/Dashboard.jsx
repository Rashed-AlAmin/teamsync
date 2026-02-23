import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TeamSync Dashboard</h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-slate-300">
              {user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-sm text-slate-300">
          This is a placeholder dashboard. You can now wire up workspaces, channels, and messages.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;

