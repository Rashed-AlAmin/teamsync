const Dashboard = () => {
  return (
    <div className="h-full w-full bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">TeamSync Dashboard</h1>
      </header>
      <main className="p-6">
        <p className="text-sm text-slate-300">
          This is a placeholder dashboard content area. Select a workspace from the sidebar to
          start working.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;

