'use client';

import React, { useState } from 'react';
import { Building2, Search, Check, ShieldCheck } from 'lucide-react';

interface NetBankingTabProps {
  selectedBank: string;
  setSelectedBank: (code: string) => void;
}

export default function NetBankingTab({ selectedBank, setSelectedBank }: NetBankingTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const popularBanks = [
    { code: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
    { code: 'ICIC', name: 'ICICI Bank', short: 'ICICI' },
    { code: 'SBIN', name: 'State Bank of India', short: 'SBI' },
    { code: 'UTIB', name: 'Axis Bank', short: 'Axis' },
    { code: 'KKBK', name: 'Kotak Mahindra', short: 'Kotak' },
    { code: 'PUNB', name: 'Punjab National Bank', short: 'PNB' },
  ];

  const allBanks = [
    { code: 'HDFC', name: 'HDFC Bank' },
    { code: 'ICIC', name: 'ICICI Bank' },
    { code: 'SBIN', name: 'State Bank of India' },
    { code: 'UTIB', name: 'Axis Bank' },
    { code: 'KKBK', name: 'Kotak Mahindra Bank' },
    { code: 'PUNB', name: 'Punjab National Bank' },
    { code: 'BARB_R', name: 'Bank of Baroda (Retail)' },
    { code: 'CNRB', name: 'Canara Bank' },
    { code: 'UBIN', name: 'Union Bank of India' },
    { code: 'INDB', name: 'IndusInd Bank' },
    { code: 'YESB', name: 'Yes Bank' },
    { code: 'IDFB', name: 'IDFC FIRST Bank' },
    { code: 'FDRL', name: 'Federal Bank' },
    { code: 'RBL', name: 'RBL Bank' },
    { code: 'CSBK', name: 'CSB Bank' },
    { code: 'KVBL', name: 'Karur Vysya Bank' },
    { code: 'SCBL', name: 'Standard Chartered Bank' },
  ];

  const filteredBanks = allBanks.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-left">
      {/* Popular Banks Grid */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Popular Indian Banks</label>
        <div className="grid grid-cols-3 gap-2">
          {popularBanks.map((bank) => (
            <button
              key={bank.code}
              type="button"
              onClick={() => setSelectedBank(bank.code)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                selectedBank === bank.code
                  ? 'bg-purple-50 border-purple-500 text-purple-700 ring-2 ring-purple-500/20 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="truncate">{bank.short}</span>
              </div>
              {selectedBank === bank.code && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Searchable All Banks Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Or Search From 50+ Other Supported Banks
        </label>
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bank name (e.g. Canara, IndusInd)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600"
          />
        </div>

        <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 no-scrollbar">
          {filteredBanks.map((bank) => (
            <button
              key={bank.code}
              type="button"
              onClick={() => setSelectedBank(bank.code)}
              className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                selectedBank === bank.code ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{bank.name}</span>
              {selectedBank === bank.code && <Check className="w-3.5 h-3.5 text-purple-600" />}
            </button>
          ))}
          {filteredBanks.length === 0 && (
            <div className="p-3 text-center text-xs text-slate-400">No bank found matching &quot;{searchQuery}&quot;</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Redirects securely to your chosen bank&apos;s encrypted portal via Cashfree NetBanking.</span>
      </div>
    </div>
  );
}
