import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function AIAssistant({ merchantId, merchantName }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste! I am your **Paytm Merchant Growth AI Partner** for **${merchantName}**.\n\nI have real-time access to your store's transaction data, customer RFM segments, and XGBoost sales predictions.\n\nAsk me anything about your sales trends, why a specific recommendation was generated, or how to boost revenue!`,
      model: 'Paytm Growth AI'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestionChips = [
    "Why was my top recommendation suggested?",
    "Summarize my store's performance & repeat rate",
    "How can I fix the mid-week afternoon sales slump?",
    "Explain the XGBoost 14-day sales forecast"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for API
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.queryAssistant(merchantId, text, history);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.response,
          model: response.model_used,
          referencedMetrics: response.referenced_metrics,
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Could not reach AI partner service: ${err.message}. Please check that the FastAPI backend is running and GEMINI_API_KEY is configured.`,
          model: 'System Error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#002970] to-[#00BAF2] p-4 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-amber-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Paytm AI Business Assistant</h2>
            <p className="text-xs text-sky-100">
              Grounded in {merchantName}'s real analytics & recommendations
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Gemini API
          </span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-[#00BAF2]" /> Suggested:
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="text-xs bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs font-medium disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-[#002970] text-amber-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#002970] text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap space-y-1 font-sans">
                {msg.content}
              </div>

              {msg.model && (
                <div
                  className={`mt-2 pt-2 border-t text-[10px] flex items-center justify-between ${
                    msg.role === 'user'
                      ? 'border-white/10 text-sky-200'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span>Model: {msg.model}</span>
                  {msg.referencedMetrics && (
                    <span>Grounded Context Verified ✓</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#002970] text-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-3 text-xs text-slate-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#00BAF2] animate-spin" />
              <span>Analyzing store context & synthesizing recommendation insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${merchantName}'s sales, discounts, or recommendations...`}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-transparent transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-[#002970] hover:bg-[#003893] text-white p-2.5 rounded-xl disabled:opacity-40 transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
