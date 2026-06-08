import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, Send, MessageCircle, Minus } from "lucide-react";
import { hasDecided, CONSENT_EVENT } from "@/lib/consent";

// Persona avatar initials and accent colours
const PERSONA_COLOURS: Record<string, string> = {
  Mila: "#6B7A3E",
  Jade: "#8B6E4E",
  Cass: "#4E6B7A",
  Lena: "#7A4E6B",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Typing indicator dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "rgba(45,44,44,0.3)",
            animation: `chatDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  // Don't show the launcher until the cookie/consent banner is dealt with, so
  // the two fixed bottom-corner elements never overlap.
  const [consentDecided, setConsentDecided] = useState<boolean>(() => hasDecided());
  useEffect(() => {
    if (consentDecided) return;
    const handler = () => setConsentDecided(true);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, [consentDecided]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Stable session ID for this browser session (persisted in sessionStorage)
  const [sessionId] = useState<string>(() => {
    const stored = sessionStorage.getItem("reni_chat_session");
    if (stored) return stored;
    const id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem("reni_chat_session", id);
    return id;
  });

  const { data: persona } = trpc.chat.getPersona.useQuery(undefined, {
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });

  const sendMessage = trpc.chat.send.useMutation();

  const personaColour = persona ? (PERSONA_COLOURS[persona.name] ?? "#6B7A3E") : "#6B7A3E";
  const personaInitial = persona?.name?.[0] ?? "R";
  // Business hours flag from server (Mon-Fri 9am-6pm AEST)
  const inBusinessHours = persona?.isBusinessHours ?? true;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (open && !minimised) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, open, minimised]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && !minimised) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimised]);

  // Send the greeting when chat first opens
  const handleOpen = () => {
    setOpen(true);
    setMinimised(false);
    if (!hasOpened && persona) {
      setHasOpened(true);
      // Show typing for ~1.2s then deliver greeting
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{
          role: "assistant",
          content: persona.greeting,
          timestamp: new Date(),
        }]);
      }, 1200);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    // Build history for LLM (exclude the current message, it's sent separately)
    const history = newMessages.slice(0, -1).map(m => ({
      role: m.role,
      content: m.content,
    }));

    const isFirstMessage = messages.length === 1; // only greeting so far

    try {
      // In-hours: 4500ms base + up to 1000ms jitter = ~5s feel
      // Out-of-hours: 13500ms base + up to 3000ms jitter = ~15s feel
      const baseDelay = inBusinessHours ? 4500 : 13500;
      const jitter = inBusinessHours ? Math.random() * 1000 : Math.random() * 3000;
      const typingDelay = baseDelay + jitter;

      const [result] = await Promise.all([
        sendMessage.mutateAsync({ message: text, history, isFirstMessage, sessionId }),
        new Promise(r => setTimeout(r, typingDelay)),
      ]);

      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: result.reply,
        timestamp: new Date(),
      }]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong on my end. Try again in a moment, or reach us at hello@renicosmetics.com.au.",
        timestamp: new Date(),
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suggested quick questions
  const QUICK_QUESTIONS = [
    "Which product should I start with?",
    "How long until I see results?",
    "Is this suitable for sensitive skin?",
    "What's the AM/PM routine?",
  ];

  const handleQuick = (q: string) => {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes chatDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(107,122,62,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(107,122,62,0); }
        }
      `}</style>

      {/* Floating launcher button — hidden until consent banner is resolved */}
      {!open && consentDecided && (
        <button
          onClick={handleOpen}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
          style={{
            background: "#2D2C2C",
            animation: "chatPulse 3s ease-in-out infinite",
          }}
        >
          <MessageCircle size={22} color="#EAEADF" />
          {/* Unread dot — shown before first open */}
          {!hasOpened && (
            <span
              className="absolute top-1 right-1 w-3 h-3 rounded-full"
              style={{ background: personaColour, border: "2px solid #2D2C2C" }}
            />
          )}
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col shadow-2xl"
          style={{
            width: "min(380px, calc(100vw - 24px))",
            maxHeight: minimised ? "auto" : "min(560px, calc(100vh - 100px))",
            background: "#FAFAF7",
            border: "1px solid rgba(45,44,44,0.12)",
            animation: "chatSlideUp 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 shrink-0"
            style={{ background: "#2D2C2C", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Persona avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: personaColour, color: "#fff" }}
            >
              {personaInitial}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-none" style={{ color: "#EAEADF" }}>
                {persona?.name ?? "Reni"}, your Reni assistant
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(234,234,223,0.4)" }}>
                {persona?.isBusinessHours ? "Online now" : "Replies instantly"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimised(!minimised)}
                className="w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-60"
                aria-label={minimised ? "Expand chat" : "Minimise chat"}
              >
                <Minus size={14} color="rgba(234,234,223,0.6)" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded transition-opacity hover:opacity-60"
                aria-label="Close chat"
              >
                <X size={14} color="rgba(234,234,223,0.6)" />
              </button>
            </div>
          </div>

          {!minimised && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
                style={{ minHeight: 0 }}
              >
                {messages.length === 0 && !isTyping && (
                  <div className="text-center py-8">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold mx-auto mb-3"
                      style={{ background: personaColour, color: "#fff" }}
                    >
                      {personaInitial}
                    </div>
                    <p className="text-xs" style={{ color: "rgba(45,44,44,0.4)" }}>
                      Starting conversation...
                    </p>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5"
                        style={{ background: personaColour, color: "#fff" }}
                      >
                        {personaInitial}
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className="text-xs leading-relaxed px-3 py-2.5"
                        style={{
                          background: msg.role === "user" ? "#2D2C2C" : "#EAEADF",
                          color: msg.role === "user" ? "#EAEADF" : "#2D2C2C",
                        }}
                      >
                        {msg.content}
                      </div>
                      <p
                        className="text-[9px] mt-1 px-1"
                        style={{
                          color: "rgba(45,44,44,0.3)",
                          textAlign: msg.role === "user" ? "right" : "left",
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 mt-0.5"
                      style={{ background: personaColour, color: "#fff" }}
                    >
                      {personaInitial}
                    </div>
                    <div style={{ background: "#EAEADF" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick questions — shown only before first user message */}
              {messages.length <= 1 && !isTyping && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
                  {QUICK_QUESTIONS.map(q => (
                    <button
                      key={q}
                      onClick={() => handleQuick(q)}
                      className="text-[10px] px-2.5 py-1.5 transition-opacity hover:opacity-70"
                      style={{
                        background: "#EAEADF",
                        color: "#2D2C2C",
                        border: "1px solid rgba(45,44,44,0.1)",
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div
                className="flex items-center gap-2 px-3 py-3 shrink-0"
                style={{ borderTop: "1px solid rgba(45,44,44,0.1)" }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about the products..."
                  disabled={isTyping}
                  className="flex-1 text-xs outline-none bg-transparent"
                  style={{ color: "#2D2C2C" }}
                  maxLength={500}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity disabled:opacity-30"
                  style={{ background: "#2D2C2C" }}
                  aria-label="Send message"
                >
                  <Send size={13} color="#EAEADF" />
                </button>
              </div>

              {/* Legal disclosure — small, honest, unobtrusive */}
              <p
                className="text-[9px] text-center px-4 pb-2.5 shrink-0"
                style={{ color: "rgba(45,44,44,0.25)" }}
              >
                Reni assistant. Responses are AI-generated and for guidance only.
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
