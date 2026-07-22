'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Zerify and how does it compare to Billo or traditional agencies?',
      answer: 'Zerify is an AI-powered creator marketplace that connects eCommerce brands directly with vetted video creators. Unlike traditional agencies that charge thousands in upfront retainers, Zerify gives you pay-per-video pricing, direct communication with creators, instant escrow payment protection, and videos delivered in under 5 days.',
    },
    {
      question: 'How do creators join Zerify and get paid?',
      answer: 'Creators apply to the Zerify Creator Network by linking their social accounts (Instagram, TikTok, YouTube). Once vetted, creators can accept video briefs from top brands, film authentic UGC content, submit videos directly through our portal, and receive instant payouts via Stripe as soon as the brand approves.',
    },
    {
      question: 'Do I get full commercial usage rights for the videos?',
      answer: 'Yes! Every video created on Zerify includes full digital ad rights, enabling you to run the content on Meta Ads (Facebook/Instagram), TikTok Ads, YouTube Shorts, Google Ads, Amazon, and your own website storefront without additional royalty fees.',
    },
    {
      question: 'How does the VIP Waitlist work?',
      answer: 'Joining the VIP Waitlist guarantees you early access to the Zerify V1 platform prior to public launch, plus an exclusive 50% discount on your first creator video campaign or initial creator payout bonus.',
    },
    {
      question: 'Can I request revisions if I need changes to a video?',
      answer: 'Absolutely. Zerify includes 1 free round of revisions for every video brief to ensure the messaging, hook, and call-to-action align perfectly with your brand guidelines.',
    },
  ];

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#07090E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400 mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked <span className="text-gradient-accent">Questions</span>
          </h2>
          <p className="mt-4 text-slate-400 text-base sm:text-lg">
            Everything you need to know about joining Zerify as a Brand or Creator.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl glass-card border border-white/10 overflow-hidden transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-base sm:text-lg text-white hover:text-purple-300 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-pink-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4 animate-fade-in">
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
