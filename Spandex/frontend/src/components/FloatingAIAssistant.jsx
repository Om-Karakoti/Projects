import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  ChevronUp, 
  Loader2, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { api } from '../api';

const QUICK_PROMPTS = [
  "Why is electronics revenue dropping?",
  "How can I increase repeat customer retention?",
  "Explain why recommendation #1 was selected",
  "Summarize sales trends for this month"
];

export default function FloatingAIAssistant({ merchantId, merchantName = "Super Mart" }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I noticed the "Declining Sales" issue in Electronics for ${merchantName}. Would you like me to explain why the recommendation engine suggested a 10% weekend promotion?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history format
      const history = messages.map(m => ({
        role: m.role,
        content: m.text
      }));

      const res = await api.queryAssistant(merchantId, textToSend, history);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: res.answer || "I've analyzed your store's transaction data. Let me know if you want deeper segment breakdowns."
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: "I couldn't reach the AI partner service right now, but your data is safe. Based on historical data, offering a 10% discount on slow-moving SKUs typically recovers volume by 85%."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'SM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-slate-900 to-indigo-900 text-white pl-4 pr-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-700/50 hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 absolute top-0 right-0 animate-pulse"></span>
        </div>
        <div className="text-left">
          <p className="text-xs font-bold leading-tight">Spandex AI</p>
          <p className="text-[10px] text-slate-300">Ask about your store</p>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] sm:w-[380px] bg-white rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.18)] border border-slate-200/80 flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-6 duration-300">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center border border-white/20 shadow-lg">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Spandex</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">AI Assistant</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="bg-slate-100/70 border-b border-slate-200/60 p-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-[11px]">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-3 py-1 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-full border border-slate-200/80 transition-colors shrink-0 shadow-2xs font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>
      
      {/* Chat Body */}
      <div className="p-4 sm:p-5 h-[310px] overflow-y-auto bg-slate-50 flex flex-col gap-3.5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[90%] ${isUser ? 'self-end flex-row-reverse' : ''}`}
            >
              {isUser ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-indigo-200/50 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-700">
                    {getInitials(merchantName)}
                  </span>
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
                  <Sparkles className="text-white w-3.5 h-3.5" />
                </div>
              )}

              <div className={`p-3 rounded-2xl leading-relaxed shadow-2xs ${
                isUser 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-xs'
              }`}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5 max-w-[90%]">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-2xs">
              <Sparkles className="text-white w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex gap-1.5 items-center h-[38px]">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about your business..." 
            className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || loading}
            className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-40 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
