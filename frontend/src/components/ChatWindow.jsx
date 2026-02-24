import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import MessageInput from './MessageInput';

const ChatWindow = ({ workspaceId, channel, channelId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    setMessages([]);
    setError('');
    setLoading(true);

    if (!workspaceId || !channelId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let intervalId;

    const load = async () => {
      try {
        const res = await api.get(
          `/workspaces/${workspaceId}/channels/${channelId}/messages`,
        );
        if (!cancelled) {
          setMessages(res.data || []);
          setError('');
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load messages');
          setLoading(false);
        }
      }
    };

    load();
    intervalId = setInterval(load, 3000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [workspaceId, channelId]);

  const groupedMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];

    const groups = [];
    const now = new Date();

    const getLabel = (date) => {
      const d = new Date(date);
      const isToday = d.toDateString() === now.toDateString();
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1,
      );
      const isYesterday = d.toDateString() === yesterday.toDateString();
      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';
      return d.toLocaleDateString();
    };

    messages.forEach((msg) => {
      const label = msg.timestamp ? getLabel(msg.timestamp) : 'Unknown date';
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.label !== label) {
        groups.push({ label, items: [msg] });
      } else {
        lastGroup.items.push(msg);
      }
    });

    return groups;
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [groupedMessages, channelId]);

  const handleSend = async (content) => {
    if (!workspaceId || !channelId || !user) return;

    const optimistic = {
      id: `temp-${Date.now()}`,
      senderId: user.uid,
      senderName: user.displayName || user.email || 'You',
      content,
      type: 'text',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.post(
        `/workspaces/${workspaceId}/channels/${channelId}/messages`,
        { content },
      );
      // Polling will pick up the confirmed message from backend.
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  if (!workspaceId || !channelId) {
    return (
      <div className="flex h-full flex-1 flex-col bg-slate-950">
        <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
          Select a channel to start chatting.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">#</span>
          <h2 className="text-sm font-semibold">
            {channel?.name || 'Channel'}
          </h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="text-xs text-slate-400">Loading messages...</div>
        )}
        {!loading && error && (
          <div className="text-xs text-red-400">{error}</div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="text-xs text-slate-500">
            No messages yet. Start the conversation!
          </div>
        )}
        {!loading &&
          !error &&
          groupedMessages.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-slate-900 px-3 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-800">
                  {group.label}
                </span>
              </div>
              {group.items.map((msg) => (
                <div key={msg.id} className="flex flex-col text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-slate-100">
                      {msg.senderName || 'Unknown'}
                    </span>
                    {msg.timestamp && (
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          ))}
        <div ref={scrollRef} />
      </div>

      <MessageInput
        onSend={handleSend}
        disabled={!workspaceId || !channelId}
      />
    </div>
  );
};

export default ChatWindow;