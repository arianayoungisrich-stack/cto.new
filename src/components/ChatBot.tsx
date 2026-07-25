import { useState, useRef, useEffect, useCallback } from "react";
import { initChat, chatMessage } from "../utils/chatbot-server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface CollectedInfo {
  name?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  website?: string;
  monthlyLeads?: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collected, setCollected] = useState<CollectedInfo>({});
  const [stage, setStage] = useState("greeting");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !initialized.current) {
      initialized.current = true;
      setLoading(true);
      initChat()
        .then((result) => {
          if ("sessionId" in result && "message" in result) {
            setSessionId(result.sessionId);
            setMessages([result.message as ChatMessage]);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || loading) return;
    setInput("");
    setLoading(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await chatMessage({ data: { sessionId, message: text } });
      if ("reply" in result) {
        const assistantMsg: ChatMessage = { role: "assistant", content: result.reply };
        setMessages((prev) => [...prev, assistantMsg]);
        setCollected(result.collected);
        setStage(result.stage);
      } else if ("error" in result) {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had a hiccup. Can you try again?" }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Hmm, something went wrong. Let me know if you'd like to try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[9999] w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 hover:shadow-indigo-200/50 hover:shadow-2xl group"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{ touchAction: "manipulation" }}
      >
        {isOpen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {/* Pulse ring */}
        {!isOpen && <span className="absolute inset-0 rounded-2xl animate-ping-slow bg-indigo-400/30 -z-10" />}
      </button>

      {/* Chat window */}
      <div
        className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-[9998] w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
        style={{ maxHeight: "min(560px, calc(100vh - 120px))" }}
        inert={!isOpen ? "" : undefined}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-t-2xl shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">ReplyBot</div>
            <div className="text-xs text-indigo-200">
              {loading ? "Thinking..." : stage === "completed" ? "Ready to help!" : "AI Assistant"}
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth" style={{ scrollBehavior: "smooth" }}>
          {messages.length === 0 && !loading && (
            <div className="text-center text-slate-400 text-sm py-8">
              <div className="text-4xl mb-3">💬</div>
              <p>Ask me anything about Reply AI!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in`}
              style={{ animation: "fadeIn 0.3s ease-out" }}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-2xl rounded-br-md shadow-sm"
                    : "bg-slate-50 text-slate-700 rounded-2xl rounded-bl-md border border-slate-100"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 text-slate-400 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Progress indicator */}
        {collected && Object.keys(collected).length > 0 && stage !== "completed" && (
          <div className="px-4 py-2 border-t border-slate-50">
            <div className="flex gap-1.5">
              {["name", "businessType", "email", "phone", "website", "monthlyLeads"].map((field) => (
                <div
                  key={field}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    (collected as any)[field] ? "bg-indigo-500" : "bg-slate-200"
                  }`}
                  title={field.replace(/([A-Z])/g, " $1").trim()}
                />
              ))}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 text-center">
              {Object.keys(collected).length}/6 collected
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-slate-50 text-sm text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder-slate-400 disabled:opacity-50 transition-all"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}