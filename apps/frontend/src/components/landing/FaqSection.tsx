'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Zerify and how does it differ from traditional ad agencies?',
      answer: 'Zerify is a direct collaboration platform that connects brands and content creators directly. We are not an ad agency — we provide the end-to-end infrastructure for direct briefs, verified reach stats, automated campaign management, and escrow payouts without agency fees or hidden markups.',
    },
    {
      question: 'How do creators and influencers collaborate on Zerify?',
      answer: 'Creators join the Zerify network by connecting their social accounts (Instagram, TikTok, YouTube). Brands send structured campaign briefs or direct invitations. Once accepted, creators film authentic content, submit deliverables through the portal, and receive instant payouts upon brand approval.',
    },
    {
      question: 'Are commercial usage and digital ad rights included?',
      answer: 'Yes. Every campaign conducted through Zerify includes full commercial licensing and digital rights, allowing brands to run the content across digital ad channels, social platforms, and website storefronts.',
    },
    {
      question: 'How does the Priority VIP Waitlist work?',
      answer: 'Joining the VIP Waitlist grants your brand or creator account priority queue status for early platform access prior to public release, alongside early access onboarding support.',
    },
    {
      question: 'How are campaign payments secured?',
      answer: 'Campaign payments are held securely in Escrow until the final content is reviewed and approved by the brand, protecting both brands and creators throughout the collaboration.',
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Platform FAQs</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Questions</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Everything you need to know about direct collaboration on Zerify.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden transition-all duration-300 shadow-xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-400' : ''
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
