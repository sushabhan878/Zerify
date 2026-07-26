'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

export default function BrandMessagesSection() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputText, setInputText] = useState('');

  const chats = [
    { id: 1, name: 'Sarah Jenkins', handle: '@sarah_creativ', unread: 2, lastMsg: 'Sent the draft video preview link for approval.', time: '11:15 AM' },
    { id: 2, name: 'Marcus Vance', handle: '@marcus_vfit', unread: 0, lastMsg: 'Received the shipping details for the product package.', time: 'Yesterday' },
    { id: 3, name: 'Elena Rostova', handle: '@elena_glow', unread: 0, lastMsg: 'Reel is scheduled for Friday 4 PM EST.', time: 'Jul 23' },
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: 'creator', text: 'Hi Alex! Uploaded the video draft for review.', time: '11:00 AM' },
    { id: 2, sender: 'me', text: 'Awesome Sarah! Checking it out now with the team.', time: '11:10 AM' },
    { id: 3, sender: 'creator', text: 'Sent the draft video preview link for approval.', time: '11:15 AM' },
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
      {/* Chat List */}
      <div className="w-full md:w-72 border-r border-white/10 p-4 space-y-3 shrink-0 bg-slate-950/40">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Creator Messages</span>
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
              <div className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
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

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950/20">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
          <div>
            <h3 className="text-sm font-bold text-white">{selectedChat.name}</h3>
            <span className="text-[11px] text-purple-400 font-semibold">{selectedChat.handle}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
            Active Campaign #CNT-901
          </span>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                  msg.sender === 'me'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none shadow-md shadow-purple-950/40'
                    : 'bg-slate-800 border border-white/10 text-slate-200 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[9.5px] opacity-70 block text-right">{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 bg-slate-900/60">
          <input
            type="text"
            placeholder="Type message to creator..."
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
