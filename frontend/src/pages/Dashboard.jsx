const Dashboard = () => {
  return (
    <div className="h-full w-full bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-6 py-4 hidden md:flex items-center justify-between">
        <h1 className="text-xl font-semibold">TeamSync Dashboard</h1>
      </header>
      <main className="p-6 flex flex-col gap-3">
        <p className="text-sm text-slate-300">
          Select a workspace from the sidebar to start working.
        </p>
        {/* Mobile hint — only shown on small screens */}
        <p className="text-xs text-slate-500 md:hidden">
          Tap the <span className="text-indigo-400 font-medium">☰ menu</span> in the top-left to choose or create a workspace.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;