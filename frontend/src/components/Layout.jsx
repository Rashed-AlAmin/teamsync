import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = ({ children }) => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-50 flex flex-col overflow-hidden">

      {/* ── Mobile-only top bar (hidden md+) ── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/80 md:hidden shrink-0">
        <button
          type="button"
          onClick={() => setShowMobileSidebar(true)}
          className="rounded-md bg-slate-800 p-2 hover:bg-indigo-600/30 transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-300" />
        </button>
        <span className="text-lg font-bold tracking-tight text-indigo-400">TeamSync</span>
      </div>

      {/* ── Main row ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Desktop Workspace Sidebar — hidden on mobile */}
        <div className="hidden md:flex h-full w-64 shrink-0 border-r border-slate-800 bg-slate-900/50">
          <Sidebar />
        </div>

        {/* Page content */}
        <main className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
          {children || <Outlet />}
        </main>
      </div>

      {/* ── Mobile workspace drawer ── */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileSidebar(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 h-full bg-slate-950 flex flex-col border-r border-slate-800 shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 shrink-0">
              <span className="text-sm font-bold text-indigo-400">Workspaces</span>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Full sidebar content */}
            <div className="flex-1 overflow-y-auto">
              <Sidebar onWorkspaceSelect={() => setShowMobileSidebar(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;