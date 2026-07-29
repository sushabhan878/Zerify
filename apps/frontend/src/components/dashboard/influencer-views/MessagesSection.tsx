'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Paperclip, CheckCheck, Building2, Search, CheckCircle2, ShieldCheck, FileText, Phone, Video } from 'lucide-react';

export default function MessagesSection() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const chats = [
    {
      id: 1,
      name: 'Sony Audio Systems',
      contact: 'Sarah Jenkins (Lead PR)',
      unread: 2,
      lastMsg: 'Sounds great! Sent the revised brief for the 60s integration.',
      time: '10:42 AM',
      online: true,
      campaign: 'WH-1000XM5 Launch',
      statusTag: 'Contract Sent',
    },
    {
      id: 2,
      name: 'Gymshark Activewear',
      contact: 'Marcus Vance (Influencer Manager)',
      unread: 0,
      lastMsg: 'The sample package was shipped via FedEx tracking #90214.',
      time: 'Yesterday',
      online: false,
      campaign: 'Fall Seamless Collection',
      statusTag: 'In Production',
    },
    {
      id: 3,
      name: 'FlexiSpot Official',
      contact: 'Elena Rostova (Partnerships)',
      unread: 0,
      lastMsg: 'Approved draft! Proceed with posting on Friday at 7 PM.',
      time: 'Jul 24',
      online: true,
      campaign: 'Ergonomic Desk Setup',
      statusTag: 'In Content Review',
    },
  ];

  const [messages, setMessages] = useState<Record<number, Array<{ id: number; sender: 'me' | 'brand'; text: string; time: string; attachment?: string }>>>({
    1: [
      { id: 1, sender: 'brand', text: 'Hi Sarah! We loved your recent YouTube camera & audio review video.', time: '10:30 AM' },
      { id: 2, sender: 'me', text: 'Thank you Sarah! Excited to partner with Sony Audio on this release.', time: '10:35 AM' },
      { id: 3, sender: 'brand', text: 'Sounds great! Sent the revised brief for the 60s integration with custom discount link.', time: '10:42 AM', attachment: 'Sony_Campaign_Brief_v2.pdf' },
    ],
    2: [
      { id: 1, sender: 'brand', text: 'Hi! Your apparel sizes have been confirmed.', time: 'Yesterday 2:15 PM' },
      { id: 2, sender: 'brand', text: 'The sample package was shipped via FedEx tracking #90214.', time: 'Yesterday 2:16 PM' },
    ],
    3: [
      { id: 1, sender: 'me', text: 'Hi Elena, submitted the desk setup draft video for review!', time: 'Jul 24 4:00 PM' },
      { id: 2, sender: 'brand', text: 'Approved draft! Proceed with posting on Friday at 7 PM.', time: 'Jul 24 5:30 PM' },
    ],
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const currentMsgs = messages[activeChat] || [];
    setMessages({
      ...messages,
      [activeChat]: [...currentMsgs, { id: Date.now(), sender: 'me', text: inputText, time: 'Just now' }],
    });
    setInputText('');
  };

  const selectedChat = chats.find((c) => c.id === activeChat) || chats[0];
  const activeMessages = messages[activeChat] || [];

  const filteredChats = chats.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>Brand Messenger Workspace</span>
          </h2>
          <p className="text-xs text-slate-400">Direct encrypted chat channel with brand managers and campaign leads</p>
        </div>
      </div>

      {/* Main Glass Chat Container */}
      <div className="h-[620px] rounded-2xl bg-slate-950/45 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        {/* Chat List Sidebar */}
        <div className="w-full md:w-80 border-r border-white/10 p-3.5 space-y-3 shrink-0 bg-slate-950/60 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[480px]">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 relative ${
                    activeChat === chat.id
                      ? 'bg-purple-600/20 border border-purple-500/40 shadow-md'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 font-black text-purple-300 flex items-center justify-center text-xs shadow-md">
                      {chat.name.charAt(0)}
                    </div>
                    {chat.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{chat.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{chat.time}</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 block truncate">{chat.campaign}</span>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{chat.lastMsg}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Workspace */}
        <div className="flex-1 flex flex-col justify-between bg-slate-950/20">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shrink-0">
                {selectedChat.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>{selectedChat.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">{selectedChat.contact}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-extrabold text-purple-300 hidden sm:inline-block">
                {selectedChat.statusTag}
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {activeMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 ${
                    msg.sender === 'me'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.attachment && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-white/10 text-purple-300 text-[11px] font-semibold">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="truncate">{msg.attachment}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 text-[9.5px] opacity-70 pt-0.5">
                    <span>{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-pink-200" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/10 flex items-center gap-2 bg-slate-950/60 backdrop-blur-xl">
            <button type="button" className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Type your message or negotiate pitch terms..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-xs font-bold text-white shadow-lg shadow-purple-950/50 transition-all flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
