import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import ChannelList from '../components/ChannelList';
import ChatWindow from '../components/ChatWindow';
import MemberList from '../components/MemberList';

const WorkspacePage = () => {
  const { workspaceId, channelId } = useParams();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            navigate(
              `/workspace/${workspaceId}/channel/${list[0].id}`,
              { replace: true },
            );
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

    return () => {
      cancelled = true;
    };
  }, [workspaceId, channelId, navigate]);

  const handleChannelCreated = (channel) => {
    setChannels((prev) => [...prev, channel]);
  };

  const activeChannel =
    channels.find((c) => c.id === channelId) || null;

    return (
      /* FIX: Added overflow-hidden to the parent and flex-1 to children */
      <div className="flex h-full w-full bg-slate-950 text-slate-50 overflow-hidden">
        <div className="flex-shrink-0">
          <ChannelList
            workspaceId={workspaceId}
            channels={channels}
            loading={loading}
            error={error}
            onChannelCreated={handleChannelCreated}
          />
        </div>
        
        <main className="flex-1 min-w-0 h-full relative">
          <ChatWindow
            workspaceId={workspaceId}
            channel={activeChannel}
            channelId={channelId}
          />
        </main>
    
        {/* MemberList is already set up to be flex-1 min-w-0 internally */}
        <aside className="hidden lg:flex w-80 flex-shrink-0">
           <MemberList workspaceId={workspaceId} />
        </aside>
      </div>
    );
};

export default WorkspacePage;

