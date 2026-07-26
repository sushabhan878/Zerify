'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Paperclip, CheckCheck, Building2 } from 'lucide-react';

export default function MessagesSection() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputText, setInputText] = useState('');

  const chats = [
    { id: 1, name: 'CyberPulse AI', contact: 'Alex Rivera (Brand Lead)', unread: 2, lastMsg: 'Sounds great! Sent the revised brief for the 60s integration.', time: '10:42 AM' },
    { id: 2, name: 'Apex Gear', contact: 'Marcus Vance', unread: 0, lastMsg: 'The sample package was shipped yesterday.', time: 'Yesterday' },
    { id: 3, name: 'Aura Skincare', contact: 'Elena Rostova', unread: 0, lastMsg: 'Approved draft! Proceed with posting on Friday.', time: 'Jul 24' },
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: 'brand', text: 'Hi Sarah! We loved your recent YouTube review video.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Thank you Alex! Happy to collaborate with CyberPulse.', time: '10:35 AM' },
    { id: 3, sender: 'brand', text: 'Sounds great! Sent the revised brief for the 60s integration.', time: '10:42 AM' },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'me', text: inputText, time: 'Just now' }]);
    setInputText('');
  };

  const selectedChat = chats.find((c) => c.id === activeChat) || chats[0];

  return (
    <div className="h-[600px] rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
      {/* Chat List Sidebar */}
      <div className="w-full md:w-72 border-r border-white/10 p-4 space-y-3 shrink-0 bg-slate-950/40">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Brand Messages</span>
        </h2>

        <div className="space-y-1.5 overflow-y-auto">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 ${
                activeChat === chat.id ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs shrink-0">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{chat.name}</span>
                  <span className="text-[10px] text-slate-500">{chat.time}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{chat.lastMsg}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950/20">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold text-white">{selectedChat.name}</h3>
            <span className="text-[11px] text-slate-400">{selectedChat.contact}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
            Active Campaign Negotiation
          </span>
        </div>

        {/* Messages Stream */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-md shadow-purple-950/40'
                    : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[9.5px] opacity-70 block text-right">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-slate-900/60">
          <input
            type="text"
            placeholder="Type your message to brand..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button type="submit" className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
