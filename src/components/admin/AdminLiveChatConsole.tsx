import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChatMessage, ChatThread } from '../../types';
import { subscribeAllChatThreads, subscribeChatMessages, sendChatMessage } from '../../services/firebase/chat';
import { playSound } from '../../utils/audio';
import {
  MessageSquare,
  Search,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Zap,
  Filter,
  RefreshCw,
  X
} from 'lucide-react';

const QUICK_SNIPPETS = [
  '✅ Your UPI payment has been verified and wallet balance is credited!',
  '🔍 Please provide your 12-digit UTR / Bank Reference Number from your payment receipt.',
  '👑 As a VIP member, your custom card engraving request has been sent to our vault team.',
  '⚡ Thank you for reaching out! Let us know if you need anything else.',
];

export const AdminLiveChatConsole: React.FC = () => {
  const { currentUser, soundEnabled, addAuditLog } = useStore();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all threads in real time
  useEffect(() => {
    const unsub = subscribeAllChatThreads((newThreads) => {
      setThreads(newThreads);
      if (!selectedThreadId && newThreads.length > 0) {
        setSelectedThreadId(newThreads[0].userId);
      }
    });

    return () => unsub();
  }, [selectedThreadId]);

  // Subscribe to selected thread messages
  useEffect(() => {
    if (!selectedThreadId) return;

    const unsub = subscribeChatMessages(selectedThreadId, (newMsgs) => {
      setMessages(newMsgs);
    });

    return () => unsub();
  }, [selectedThreadId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedThread = threads.find((t) => t.userId === selectedThreadId);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedThreadId || isSending) return;

    const text = replyText.trim();
    setReplyText('');
    setIsSending(true);
    playSound('purchase', soundEnabled);

    try {
      await sendChatMessage({
        userId: selectedThreadId,
        username: selectedThread?.username || 'Customer',
        userEmail: selectedThread?.userEmail,
        senderRole: 'admin',
        senderName: currentUser?.fullName || 'RAWAT Head Admin',
        avatarSeed: 'admin-avatar',
        text,
        category: 'GENERAL',
      });

      addAuditLog({
        action: 'SETTINGS_UPDATED',
        targetUserId: selectedThreadId,
        targetUsername: selectedThread?.username,
        reason: `Replied to live customer support chat: "${text.slice(0, 30)}..."`,
      });
    } catch (err) {
      console.warn('[Admin Chat Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredThreads = threads.filter((t) =>
    t.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-mono text-xs animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-zinc-950/80 border border-purple-500/30 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">
              Customer Success & Real-Time Desk
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-tech text-white tracking-tight">
            Live Support Chat Center
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Communicate with collectors in real time via Cloud Firestore. Reply instantly with custom messages or verified auto-snippets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Threads</span>
            <span className="text-lg font-black font-tech text-purple-400">{threads.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-black/60 border border-white/10 text-center">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Live Status</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1 justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Left: Chat Threads List */}
        <div className="lg:col-span-4 rounded-3xl bg-zinc-950/90 border border-white/10 p-4 space-y-3 flex flex-col">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user or message..."
              className="w-full bg-black/60 border border-white/10 focus:border-purple-500/40 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No active customer chats</p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.userId === selectedThreadId;
                return (
                  <button
                    key={thread.userId}
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      setSelectedThreadId(thread.userId);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500/50 shadow-md shadow-purple-950/50'
                        : 'bg-black/40 hover:bg-white/5 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-tech font-bold text-white tracking-wide text-xs">
                        @{thread.username}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(thread.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {thread.lastMessage}
                    </p>

                    {thread.unreadAdminCount > 0 && (
                      <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold">
                        New Customer Message
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Message History & Reply Box */}
        <div className="lg:col-span-8 rounded-3xl bg-zinc-950/90 border border-white/10 p-5 flex flex-col">
          {selectedThread ? (
            <>
              {/* Thread Header */}
              <div className="pb-4 border-b border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold font-tech text-sm">
                    {selectedThread.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-tech font-bold text-white text-sm">@{selectedThread.username}</h3>
                    <p className="text-[10px] text-slate-400">{selectedThread.userEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-[10px]">
                    Firestore Synced
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 my-4 p-4 rounded-2xl bg-black/60 border border-white/5 overflow-y-auto space-y-3 max-h-[350px]">
                {messages.map((msg) => {
                  const isAdmin = msg.senderRole === 'admin';
                  const isBot = msg.senderRole === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isAdmin && (
                        <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                          {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                          isAdmin
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                            : isBot
                            ? 'bg-zinc-900/90 border border-purple-500/20 text-slate-200 rounded-bl-none'
                            : 'bg-zinc-800/90 border border-white/10 text-white rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold opacity-75">
                            {isAdmin ? 'Admin Desk' : isBot ? 'Concierge Bot' : msg.senderName}
                          </span>
                          <span className="text-[9px] opacity-60">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Admin Snippets */}
              <div className="mb-3 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Quick Snippet Replies:</span>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_SNIPPETS.map((snippet, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyText(snippet)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-900/40 border border-white/10 hover:border-purple-500/40 text-[10px] text-slate-300 hover:text-purple-200 whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                    >
                      {snippet.slice(0, 35)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an official admin reply..."
                  className="flex-1 bg-black/60 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-lg shadow-purple-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-purple-400" />
              <p className="text-sm font-tech font-bold text-slate-300">Select a customer thread</p>
              <p className="text-xs">Incoming collector messages will appear in real time</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
