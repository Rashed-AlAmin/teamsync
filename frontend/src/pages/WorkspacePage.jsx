import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import ChannelList from '../components/ChannelList';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MemberList from '../components/MemberList';
import { Menu, Info } from 'lucide-react';

const WorkspacePage = () => {
  const { workspaceId, channelId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMobileChannels, setShowMobileChannels] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;

    let cancelled = false;

    const loadChannels = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/workspaces/${workspaceId}/channels`);
        if (!cancelled) {
          const list = res.data || [];
          setChannels(list);
          setLoading(false);
          if (!channelId && list.length > 0) {
            navigate(`/workspace/${workspaceId}/channel/${list[0].id}`, { replace: true });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load channels');
          setLoading(false);
        }
      }
    };

    loadChannels();
    return () => { cancelled = true; };
  }, [workspaceId, channelId, navigate]);

  const handleChannelCreated = (channel) => {
    setChannels((prev) => [...prev, channel]);
  };

  const activeChannel = channels.find((c) => c.id === channelId) || null;

  const closeMobileChannels = () => setShowMobileChannels(false);
  const closeMobileInfo = () => setShowMobileInfo(false);

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-50 overflow-hidden">

      {/* ── Mobile top navbar (hidden on md+) ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 md:hidden shrink-0">
        <button
          type="button"
          onClick={() => setShowMobileChannels(true)}
          className="rounded-md bg-slate-900 p-2 hover:bg-indigo-600/20 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold truncate">
          {activeChannel ? `# ${activeChannel.name}` : 'TeamSync'}
        </span>
        <button
          type="button"
          onClick={() => setShowMobileInfo(true)}
          className="rounded-md bg-slate-900 p-2 hover:bg-indigo-600/20 transition-colors"
        >
          <Info className="h-5 w-5" />
        </button>
      </div>

      {/* ── Desktop 3-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Column 1: Channel list (desktop only) */}
        <div className="hidden md:flex h-full w-64 shrink-0 flex-col border-r border-slate-800">
          <ChannelList
            workspaceId={workspaceId}
            channels={channels}
            loading={loading}
            error={error}
            onChannelCreated={handleChannelCreated}
          />
        </div>

        {/* Column 2: Chat window */}
        <div className="flex flex-1 min-w-0">
          <ChatWindow
            workspaceId={workspaceId}
            channel={activeChannel}
            channelId={channelId}
          />

          {/* Column 3: Info hub — visible from md+ so there's no dead zone.
              w-64 on md-lg range, w-72 on lg+. Mobile uses the right drawer. */}
          <div className="hidden md:flex h-full w-64 lg:w-72 shrink-0">
            <MemberList workspaceId={workspaceId} />
          </div>
        </div>
      </div>

      {/* ── Mobile: Left drawer (Workspaces + Channels) ── */}
      {showMobileChannels && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileChannels}
          />

          {/* Drawer */}
          <div className="relative w-72 h-full bg-slate-950 flex flex-col border-r border-slate-800 shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 shrink-0">
              <span className="text-sm font-bold text-indigo-400">TeamSync</span>
              <button
                onClick={closeMobileChannels}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Workspaces section */}
              <div className="border-b border-slate-800/60">
                <Sidebar onWorkspaceSelect={closeMobileChannels} />
              </div>

              {/* Channels section */}
              <ChannelList
                workspaceId={workspaceId}
                channels={channels}
                loading={loading}
                error={error}
                onChannelCreated={handleChannelCreated}
                onSelect={closeMobileChannels}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: Right drawer (Info Hub / Members) ── */}
      {showMobileInfo && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileInfo}
          />

          {/* Drawer */}
          <div className="relative ml-auto w-72 h-full bg-slate-950 flex flex-col border-l border-slate-800 shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 shrink-0">
              <span className="text-sm font-bold text-indigo-400">Info Hub</span>
              <button
                onClick={closeMobileInfo}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <MemberList workspaceId={workspaceId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;