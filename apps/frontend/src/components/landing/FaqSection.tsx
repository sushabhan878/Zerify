'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'brands' | 'creators'>('all');

  const faqs = [
    {
      category: 'brands',
      question: 'What is Zerify and how does it differ from traditional ad agencies?',
      answer: 'Zerify is a direct collaboration platform that connects brands and content creators directly. We are not an ad agency — we provide the end-to-end infrastructure for direct briefs, verified reach stats, automated campaign management, and escrow payouts without agency fees or hidden markups.',
    },
    {
      category: 'creators',
      question: 'How do creators and influencers collaborate on Zerify?',
      answer: 'Creators join the Zerify network by connecting their social accounts (Instagram, TikTok, YouTube). Brands send structured campaign briefs or direct invitations. Once accepted, creators film authentic content, submit deliverables through the portal, and receive instant payouts upon brand approval.',
    },
    {
      category: 'brands',
      question: 'Are commercial usage and digital ad rights included?',
      answer: 'Yes. Every campaign conducted through Zerify includes full commercial licensing and digital rights, allowing brands to run the content across digital ad channels, social platforms, and website storefronts.',
    },
    {
      category: 'all',
      question: 'How does the Priority VIP Waitlist work?',
      answer: 'Joining the VIP Waitlist grants your brand or creator account priority queue status for early platform access prior to public release, alongside early access onboarding support.',
    },
    {
      category: 'all',
      question: 'How are campaign payments secured?',
      answer: 'Campaign payments are held securely in Escrow until the final content is reviewed and approved by the brand, protecting both brands and creators throughout the collaboration.',
    },
    {
      category: 'creators',
      question: 'Do creators keep 100% of their quoted rates?',
      answer: 'Yes. Creators set their own rates for posts, stories, and videos. Zerify operates with zero hidden cuts on creator payouts so you get paid exactly what you quote.',
    },
  ];

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter((item) => item.category === 'all' || item.category === activeCategory);

  return (
    <section id="faq" className="py-28 relative overflow-hidden bg-transparent">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">

          <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15] [font-family:'Playfair_Display',Georgia,serif]">
            Frequently Asked{' '}
            <span className="italic font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300">
              Questions
            </span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to know about direct collaboration, pricing, and campaign workflows on Zerify.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'All Questions' },
              { id: 'brands', label: 'For Brands' },
              { id: 'creators', label: 'For Creators' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id as 'all' | 'brands' | 'creators');
                  setOpenIndex(0);
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${activeCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  borderColor: isOpen ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                }}
                className={`rounded-3xl bg-slate-900/80 border overflow-hidden backdrop-blur-xl transition-all duration-300 ${isOpen ? 'shadow-[0_15px_40px_rgba(168,85,247,0.15)] bg-slate-900/95' : 'hover:border-white/20'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border transition-colors ${isOpen
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 border-white/10'
                      }`}>
                      0{index + 1}
                    </span>
                    <span className="group-hover:text-purple-300 transition-colors">{faq.question}</span>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-purple-500/20 text-purple-300 rotate-180' : 'bg-slate-950 text-slate-400'
                    }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
