import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChatMessage } from '../../types';
import { subscribeChatMessages, sendChatMessage } from '../../services/firebase/chat';
import { auth } from '../../services/firebase/config';
import { playSound } from '../../utils/audio';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Minimize2,
  Maximize2
} from 'lucide-react';

const QUICK_FAQS = [
  {
    q: '⚡ How fast does UPI deposit reflect?',
    a: 'UPI deposits are typically credited within 2 to 5 minutes once you submit your 12-digit UTR reference number. Our ledger automatically alerts the admin verification queue in real time.',
    category: 'PAYMENT' as const,
  },
  {
    q: '🔑 How do I access card CVV and PIN?',
    a: 'Navigate to the "My Vault" tab in the top navigation bar. Click "Reveal & Unbox" on any card you own to trigger the secure holographic unboxing and view your full unmasked credentials.',
    category: 'DELIVERY' as const,
  },
  {
    q: '👑 What are VIP Membership perks?',
    a: 'VIP tiers (Silver, Gold, Platinum, Obsidian) grant automatic storewide discounts up to 25%, up to +10% extra deposit bonus on every top-up, and priority custom engraving.',
    category: 'VIP' as const,
  },
  {
    q: '🎟️ Is there an active promo code?',
    a: 'Yes! Use promo code "RAWAT20" at checkout for an instant 20% discount on all Genesis, Cyber Noir, and Gold Bullion card editions.',
    category: 'DISCOUNT' as const,
  },
];

export const CustomerLiveChat: React.FC = () => {
  const { currentUser, soundEnabled, isAdmin } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUserId = auth.currentUser?.uid || currentUser?.id || 'guest_user';
  const activeUsername = currentUser?.username || 'Collector';

  // Real-time Firestore subscription when signed in
  useEffect(() => {
    if (!auth.currentUser || !activeUserId) return;

    const unsubscribe = subscribeChatMessages(activeUserId, (newMsgs) => {
      if (newMsgs && newMsgs.length > 0) {
        setMessages(newMsgs);
        if (!isOpen) {
          setUnreadCount((prev) => prev + 1);
          playSound('success', soundEnabled);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [activeUserId, isOpen, soundEnabled]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleOpenChat = () => {
    playSound('click', soundEnabled);
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);

    // If initial chat is empty, send welcome bot greeting
    if (messages.length === 0) {
      sendChatMessage({
        userId: activeUserId,
        username: activeUsername,
        userEmail: currentUser?.email,
        senderRole: 'bot',
        senderName: 'RAWAT Concierge AI',
        avatarSeed: 'rawat-bot-ai',
        text: `Welcome to RAWAT Card Store Support, ${activeUsername}! How can we assist you today? Select a quick question below or type your message for our direct admin desk.`,
        category: 'GENERAL',
      }).catch(console.warn);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);
    playSound('click', soundEnabled);

    try {
      await sendChatMessage({
        userId: activeUserId,
        username: activeUsername,
        userEmail: currentUser?.email,
        senderRole: 'customer',
        senderName: currentUser?.fullName || activeUsername,
        avatarSeed: currentUser?.avatarSeed || 'customer',
        text,
        category: 'GENERAL',
      });

      // Automated Bot response fallback if customer asks common query
      const lower = text.toLowerCase();
      if (lower.includes('utr') || lower.includes('deposit') || lower.includes('payment') || lower.includes('phonepe') || lower.includes('gpay')) {
        setTimeout(async () => {
          await sendChatMessage({
            userId: activeUserId,
            username: activeUsername,
            senderRole: 'bot',
            senderName: 'RAWAT Concierge AI',
            text: 'Your deposit inquiry has been flagged for admin priority review. If you have submitted your 12-digit UTR, the balance will reflect in your wallet within 2-5 minutes.',
            category: 'PAYMENT',
          });
          playSound('success', soundEnabled);
        }, 1200);
      } else if (lower.includes('coupon') || lower.includes('discount') || lower.includes('code')) {
        setTimeout(async () => {
          await sendChatMessage({
            userId: activeUserId,
            username: activeUsername,
            senderRole: 'bot',
            senderName: 'RAWAT Concierge AI',
            text: 'You can apply promo code "RAWAT20" at checkout for an instant 20% discount on any card order!',
            category: 'DISCOUNT',
          });
          playSound('success', soundEnabled);
        }, 1200);
      }
    } catch (err) {
      console.warn('[Chat Error]', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickFaqClick = async (faq: typeof QUICK_FAQS[0]) => {
    playSound('click', soundEnabled);

    // Send user question
    await sendChatMessage({
      userId: activeUserId,
      username: activeUsername,
      userEmail: currentUser?.email,
      senderRole: 'customer',
      senderName: currentUser?.fullName || activeUsername,
      avatarSeed: currentUser?.avatarSeed || 'customer',
      text: faq.q,
      isQuickFaq: true,
      category: faq.category,
    });

    // Send bot answer immediately
    setTimeout(async () => {
      await sendChatMessage({
        userId: activeUserId,
        username: activeUsername,
        senderRole: 'bot',
        senderName: 'RAWAT Concierge AI',
        text: faq.a,
        isQuickFaq: true,
        category: faq.category,
      });
      playSound('success', soundEnabled);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={handleOpenChat}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-tech font-bold text-xs uppercase tracking-wider shadow-2xl shadow-purple-600/50 hover:shadow-purple-600/80 transition-all transform hover:-translate-y-1 cursor-pointer border border-purple-400/40"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
            </div>

            <span className="hidden sm:inline">Live Concierge</span>

            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-[380px] rounded-3xl bg-zinc-950/95 border border-purple-500/40 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl transition-all duration-300 flex flex-col font-mono text-xs overflow-hidden ${
            isMinimized ? 'h-16' : 'h-[540px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-purple-950/90 via-black to-indigo-950/90 border-b border-purple-500/30 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/40">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-tech font-bold text-white text-sm">
                  <span>RAWAT Concierge</span>
                  <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 text-[9px] uppercase">
                    24/7 LIVE
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online & Realtime Synced
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#08080f]/80">
                {messages.map((msg) => {
                  const isUser = msg.senderRole === 'customer';
                  const isBot = msg.senderRole === 'bot';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
                          {isBot ? <Bot className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-3 shadow-md ${
                          isUser
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                            : isBot
                            ? 'bg-zinc-900/90 border border-purple-500/20 text-slate-200 rounded-bl-none'
                            : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-100 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold opacity-75">
                            {isUser ? 'You' : msg.senderName}
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

              {/* Quick FAQ Prompts */}
              <div className="px-3 py-2 bg-black/80 border-t border-white/5 space-y-1.5 flex-shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-purple-400 uppercase font-bold">
                  <Sparkles className="w-3 h-3" /> Quick FAQ Suggestions:
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {QUICK_FAQS.map((faq, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleQuickFaqClick(faq)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-900/40 border border-white/10 hover:border-purple-500/40 text-[10px] text-slate-300 hover:text-purple-200 whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
                    >
                      {faq.q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-zinc-950 border-t border-purple-500/20 flex items-center gap-2 flex-shrink-0"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask a question or request support..."
                  className="flex-1 bg-black/60 border border-white/10 focus:border-purple-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
