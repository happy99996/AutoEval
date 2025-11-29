import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage } from '../types';
import { createChatSession } from '../services/geminiService';

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: "I'm your vehicle specialist. Ask me about specs, common faults, or repair costs.",
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
        chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const modelText = response.text;

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Connection interrupted. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} strokeWidth={2.5} />
      </button>

      <div className={`fixed bottom-6 right-6 w-[360px] max-w-[90vw] h-[550px] max-h-[80vh] bg-surface border border-zinc-800 rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-8 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-3xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-white">
               <Bot size={16} />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">AI Mechanic</h3>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Online</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-surface">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                 {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-white text-black rounded-tr-sm'
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-3">
               <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center flex-shrink-0 mt-1"><Bot size={12}/></div>
               <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                 <div className="flex gap-1">
                   <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                   <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                   <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-surface border-t border-zinc-800 rounded-b-3xl">
          <div className="relative group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-4 pr-12 py-3.5 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 text-sm transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-lg hover:bg-zinc-200 disabled:opacity-0 disabled:scale-75 transition-all duration-200"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatBot;