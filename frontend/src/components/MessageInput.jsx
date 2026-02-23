import { useState } from 'react';

const MessageInput = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    try {
      setSending(true);
      await onSend(trimmed);
      setValue('');
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-slate-800 px-4 py-3 bg-slate-950"
    >
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Message #channel"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled || sending}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || sending || !value.trim()}
          className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;

