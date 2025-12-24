
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types';
import { COLORS } from '../constants';
import { api } from '../services/api';

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await api.get('/chat');
      setMessages(history);
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setIsTyping(true);

    // Optimistically add user message
    const tempUserMsg = { sender: 'user', text: userText, createdAt: new Date() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post('/chat', { message: userText });
      const aiReply = { sender: 'bot', text: response.reply, createdAt: new Date() };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="pt-24 h-screen flex flex-col max-w-4xl mx-auto px-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-24 scroll-smooth pr-2 custom-scrollbar"
        style={{ scrollbarWidth: 'none' }}
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg._id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-sm relative ${
                  msg.sender === 'user' ? 'text-white' : 'text-gray-800'
                }`}
                style={{
                  backgroundColor: msg.sender === 'user' ? COLORS.secondary : COLORS.accent,
                  borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px',
                  borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '20px',
                }}
              >
                <p className="leading-relaxed whitespace-pre-wrap text-sm md:text-base">{msg.text}</p>
                <span className="text-[9px] opacity-30 absolute -bottom-5 right-1 uppercase tracking-tighter">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="px-6 py-4 rounded-2xl flex gap-1 items-center" style={{ backgroundColor: COLORS.accent }}>
              <div className="w-1.5 h-1.5 rounded-full animate-bounce bg-gray-400" />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce delay-100 bg-gray-400" />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce delay-200 bg-gray-400" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#0A3323] to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto flex gap-3 pointer-events-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-4 text-white focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: COLORS.highlight }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
