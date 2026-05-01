import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { suggestRecipes, askChef, Recipe } from "./api";

interface ChatMsg { role: "ai" | "user"; content: string; }

const INITIAL_MSG: ChatMsg = {
  role: "ai",
  content: "## Hello, Chef! 👨‍🍳\n\nI'm your **Zero-Waste AI Chef**, powered by Google Gemini. Ask me anything about using up your fridge ingredients — quick weeknight dinners, gourmet meals, or creative ways to use what's expiring soon.\n\nOr hit **Suggest Recipes** above to see what I can cook with your current inventory!",
};

export default function ChefView() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loadingRec, setLoadingRec] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([INITIAL_MSG]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const handleSuggest = async () => {
    setLoadingRec(true); setRecipes(null);
    try {
      const data = await suggestRecipes();
      setRecipes(data);
    } catch (err: any) {
      const message = err.response?.data?.detail ?? err.message ?? "Recipe generation failed";
      toast.error(message);
      setRecipes([{
        title: "Recipe generation unavailable",
        content: message,
      }]);
    } finally { setLoadingRec(false); }
  };

  const handleSend = async () => {
    const q = input.trim();
    if (!q || thinking) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", content: q }]);
    setThinking(true);
    try {
      const { data } = await askChef(q);
      const ans = data.answer ?? data.response ?? data.content ?? "No response received.";
      setMessages((p) => [...p, { role: "ai", content: ans }]);
    } catch (err: any) {
      const msg = err.response?.status === 503
        ? "⚠️ **Gemini API unavailable** — please ensure `GEMINI_API_KEY` is configured in your backend `.env`."
        : "⚠️ **Backend error** — ensure your API is running at `localhost:8000`.";
      setMessages((p) => [...p, { role: "ai", content: msg }]);
    } finally { setThinking(false); }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="max-w-[780px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-tight mb-1.5">Zero-Waste Chef</h1>
          <p className="text-[#8a9bbf] text-sm">AI-powered recipes from your current fridge inventory</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSuggest}
          disabled={loadingRec}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[11px] border border-[rgba(0,229,160,0.3)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0] text-sm font-medium hover:bg-[rgba(0,229,160,0.15)] hover:shadow-[0_0_20px_rgba(0,229,160,0.15)] disabled:opacity-60 transition-all whitespace-nowrap"
        >
          {loadingRec
            ? <div className="w-4 h-4 rounded-full border-2 border-[rgba(0,229,160,0.3)] border-t-[#00e5a0] animate-spin" />
            : <Sparkles size={15} />}
          {loadingRec ? "Generating…" : "Suggest Recipes"}
        </motion.button>
      </div>

      {/* Recipe suggestions */}
      <AnimatePresence>
        {loadingRec && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 rounded-[16px] border border-[rgba(99,157,255,0.1)] bg-[rgba(13,21,38,0.5)]">
                <div className="skeleton h-4 w-2/5 rounded mb-3" />
                <div className="skeleton h-3 w-11/12 rounded mb-2" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
            ))}
          </motion.div>
        )}
        {!loadingRec && recipes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-3 mb-6">
            {recipes.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-[16px] border border-[rgba(99,157,255,0.12)] bg-[rgba(13,21,38,0.6)]"
              >
                {r.title && (
                  <h3 className="font-display text-[15px] font-semibold text-[#e8edf8] mb-2.5">🍽 {r.title}</h3>
                )}
                <div className="text-sm text-[#8a9bbf] leading-relaxed md-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {r.content ?? r.text ?? String(r)}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <div className="rounded-[24px] border border-[rgba(99,157,255,0.12)] bg-[rgba(13,21,38,0.55)] backdrop-blur-xl overflow-hidden flex flex-col" style={{ minHeight: 480 }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5" style={{ maxHeight: 520 }}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-7 h-7 rounded-[8px] flex items-center justify-center text-sm flex-shrink-0 border ${
                m.role === "user"
                  ? "bg-[rgba(0,229,160,0.1)] border-[rgba(0,229,160,0.2)]"
                  : "bg-[rgba(99,157,255,0.08)] border-[rgba(99,157,255,0.15)]"
              }`}>
                {m.role === "user" ? "👤" : "🤖"}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-[14px] text-sm leading-relaxed md-body ${
                m.role === "user"
                  ? "bg-[rgba(0,229,160,0.1)] border border-[rgba(0,229,160,0.2)] text-[#e8edf8]"
                  : "bg-[rgba(13,21,38,0.8)] border border-[rgba(99,157,255,0.12)] text-[#e8edf8]"
              }`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              </div>
            </motion.div>
          ))}

          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm bg-[rgba(99,157,255,0.08)] border border-[rgba(99,157,255,0.15)]">🤖</div>
              <div className="px-4 py-3 rounded-[14px] bg-[rgba(13,21,38,0.8)] border border-[rgba(99,157,255,0.12)] flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-[rgba(99,157,255,0.2)] border-t-[#639dff] animate-spin" />
                <span className="text-xs text-[#8a9bbf]">Gemini is thinking…</span>
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input row */}
        <div className="px-4 py-3.5 border-t border-[rgba(99,157,255,0.1)] bg-[rgba(8,13,26,0.5)] flex gap-2.5 items-end">
          <textarea
            ref={textareaRef}
            className="flex-1 bg-[rgba(13,21,38,0.7)] border border-[rgba(99,157,255,0.12)] text-[#e8edf8] text-sm px-3.5 py-2.5 rounded-[11px] outline-none resize-none transition-colors placeholder-[#4a5878] focus:border-[rgba(99,157,255,0.3)]"
            placeholder="Ask anything — 'What can I make with eggs and cheese?' …"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKey}
            rows={1}
            style={{ minHeight: 42, maxHeight: 120 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || thinking}
            className="w-10 h-10 rounded-[11px] flex items-center justify-center bg-gradient-to-br from-[#639dff] to-[rgba(60,100,200,0.8)] text-white flex-shrink-0 hover:shadow-[0_4px_16px_rgba(99,157,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Send size={15} />
          </motion.button>
        </div>
      </div>

      <p className="text-center text-xs text-[#4a5878] mt-3">
        Powered by Google Gemini · Shift+Enter for new line · Enter to send
      </p>
    </div>
  );
}
