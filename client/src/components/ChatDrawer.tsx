import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Minus,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  PhoneCall,
  GraduationCap,
  DollarSign,
  TrendingUp,
  Sparkles
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { sendMessage } from "../services/chat.service";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpenCall?: () => void;
}

export default function ChatDrawer({ open, onClose, onOpenCall }: ChatDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm EduReach Bot. Ask me anything about courses, fees, admissions, or campus life.`,
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || sending) return;

    const userMsg: Message = { id: Date.now(), text: messageText, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      // Pass both current message and conversation history to the API
      // We filter out the welcome message (id: 1) so it doesn't pollute the prompt context.
      const conversationHistory = messages.filter((m) => m.id !== 1);
      const data = await sendMessage(messageText, conversationHistory);
      
      const botMsg: Message = { id: Date.now() + 1, text: data.message, sender: "bot" };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: "Sorry, I am having trouble connecting right now. Please try again or click the callback assistant.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    window.speechSynthesis.cancel();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: 1,
        text: `Hi ${user?.name?.split(" ")[0] || "there"}! Let's start fresh. Ask me about courses, fees, admissions, or placement reports.`,
        sender: "bot",
      },
    ]);
  };

  const handleSpeak = (id: number, text: string) => {
    if (speakingMsgId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
    } else {
      window.speechSynthesis.cancel();
      // Simple regex cleanup to strip markdown artifacts from speaking output
      const cleanText = text.replace(/\*\*|#|\*|-/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatText = (text: string) => {
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert bold markdown **boldText** to strong HTML
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert lists to list tag wrappers
    const lines = escaped.split("\n");
    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return `<li class="ml-4 list-disc my-1">${trimmed.substring(2)}</li>`;
      }
      return line;
    });

    return formattedLines
      .map((line, idx) => {
        if (line.startsWith("<li")) return line;
        return line + (idx < formattedLines.length - 1 ? "<br />" : "");
      })
      .join("");
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[580px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Glassmorphic Header */}
      <div className="bg-gradient-to-r from-maroon via-maroon-light to-maroon-dark px-4 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-maroon rounded-full animate-ping" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-maroon rounded-full" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm leading-none">EduReach AI Counselor</h3>
            <p className="text-white/80 text-xs mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Active
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button onClick={handleReset} title="Reset Chat" className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} title="Minimize" className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={onClose} title="Close" className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.sender === "bot" ? (
              <div className="w-7 h-7 bg-maroon rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <Bot className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <div className="group relative max-w-[78%]">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-200 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-maroon to-maroon-dark text-white rounded-tr-sm"
                    : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-sm"
                }`}
                dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
              />

              {/* Utility Floating Controls on Hover */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-200 ${
                  msg.sender === "user" ? "right-full mr-2" : "left-full ml-2"
                }`}
              >
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  title="Copy Text"
                  className="p-1 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-maroon hover:border-maroon/20 hover:shadow-sm transition-all"
                >
                  {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {msg.sender === "bot" && (
                  <button
                    onClick={() => handleSpeak(msg.id, msg.text)}
                    title={speakingMsgId === msg.id ? "Stop voice reading" : "Read response aloud"}
                    className="p-1 bg-white border border-gray-200 rounded-md text-gray-500 hover:text-maroon hover:border-maroon/20 hover:shadow-sm transition-all"
                  >
                    {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-maroon animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 bg-maroon rounded-full flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-200/80 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1.5 py-1">
                <span className="w-2 h-2 bg-maroon/50 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-maroon/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-maroon/50 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive Welcoming Dashboard / FAQS (Visible on start) */}
      {messages.length === 1 && !sending && (
        <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-4">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center justify-between gap-3 hover:border-maroon/30 transition-all duration-200">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-maroon animate-pulse" />
                AI Voice Assistant
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Ava can dial you immediately for voice counseling</p>
            </div>
            {onOpenCall && (
              <button
                onClick={onOpenCall}
                className="bg-maroon text-white text-xs px-3 py-1.5 rounded-lg hover:bg-maroon-dark font-medium transition-colors duration-200"
              >
                Call Ava
              </button>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Explore FAQs</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSend("What courses and seats are offered?")}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-maroon/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-20"
              >
                <GraduationCap className="w-5 h-5 text-maroon" />
                <span className="text-xs font-medium text-gray-700">🎓 B.Tech & Seats</span>
              </button>
              <button
                onClick={() => handleSend("What is the fee structure?")}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-maroon/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-20"
              >
                <DollarSign className="w-5 h-5 text-maroon" />
                <span className="text-xs font-medium text-gray-700">💰 Tuition Fees</span>
              </button>
              <button
                onClick={() => handleSend("Tell me about placements packages?")}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-maroon/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-20"
              >
                <TrendingUp className="w-5 h-5 text-maroon" />
                <span className="text-xs font-medium text-gray-700">📈 Placement Stats</span>
              </button>
              <button
                onClick={() => handleSend("What facilities are available on campus?")}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-maroon/30 hover:shadow-sm transition-all duration-200 flex flex-col justify-between h-20"
              >
                <Sparkles className="w-5 h-5 text-maroon" />
                <span className="text-xs font-medium text-gray-700">🏫 Campus Facilities</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input controls */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about admissions, fees, courses..."
            disabled={sending}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-maroon text-sm disabled:opacity-50 transition-colors duration-200"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || sending}
            className="w-10 h-10 bg-maroon text-white rounded-lg flex items-center justify-center hover:bg-maroon-dark disabled:opacity-50 transition-colors duration-200 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}