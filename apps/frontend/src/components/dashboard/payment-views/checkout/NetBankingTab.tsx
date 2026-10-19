'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Building2, Search, Check, ShieldCheck, ChevronDown, X } from 'lucide-react';

interface NetBankingTabProps {
  selectedBank: string;
  setSelectedBank: (code: string) => void;
}

interface BankItem {
  code: string;
  name: string;
  keywords?: string[];
}

export default function NetBankingTab({ selectedBank, setSelectedBank }: NetBankingTabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allBanks: BankItem[] = useMemo(
    () => [
      // Top Major Public & Private Sector Banks
      { code: 'SBIN', name: 'State Bank of India', keywords: ['sbi', 'state bank', 'sbi bank'] },
      { code: 'HDFC', name: 'HDFC Bank', keywords: ['hdfc', 'hdfc bank'] },
      { code: 'ICIC', name: 'ICICI Bank', keywords: ['icici', 'icici bank'] },
      { code: 'UTIB', name: 'Axis Bank', keywords: ['axis', 'axis bank', 'uti'] },
      { code: 'KKBK', name: 'Kotak Mahindra Bank', keywords: ['kotak', 'kotak bank', 'mahindra'] },
      { code: 'PUNB', name: 'Punjab National Bank', keywords: ['pnb', 'punjab national'] },
      { code: 'BARB_R', name: 'Bank of Baroda', keywords: ['bob', 'baroda', 'bank of baroda'] },
      { code: 'CNRB', name: 'Canara Bank', keywords: ['canara', 'canara bank'] },
      { code: 'UBIN', name: 'Union Bank of India', keywords: ['union bank', 'ubi', 'union'] },
      { code: 'BKID', name: 'Bank of India', keywords: ['boi', 'bank of india'] },
      { code: 'INDB', name: 'IndusInd Bank', keywords: ['indusind', 'indus ind'] },
      { code: 'YESB', name: 'Yes Bank', keywords: ['yes bank', 'yes'] },
      { code: 'IDFB', name: 'IDFC FIRST Bank', keywords: ['idfc', 'idfc first'] },
      { code: 'IDBI', name: 'IDBI Bank', keywords: ['idbi', 'idbi bank'] },
      { code: 'FDRL', name: 'Federal Bank', keywords: ['federal', 'federal bank'] },
      { code: 'IDIB', name: 'Indian Bank', keywords: ['indian bank', 'allahabad bank'] },
      { code: 'CBIN', name: 'Central Bank of India', keywords: ['central bank', 'cbi'] },
      { code: 'IOBA', name: 'Indian Overseas Bank', keywords: ['iob', 'overseas'] },
      { code: 'UCBA', name: 'UCO Bank', keywords: ['uco', 'uco bank'] },
      { code: 'MAHB', name: 'Bank of Maharashtra', keywords: ['maharashtra', 'bom'] },
      { code: 'PSIB', name: 'Punjab & Sind Bank', keywords: ['psb', 'punjab and sind'] },
      { code: 'RBL', name: 'RBL Bank', keywords: ['rbl', 'ratnakar'] },
      { code: 'BDBL', name: 'Bandhan Bank', keywords: ['bandhan', 'bandhan bank'] },

      // Small Finance & Payments Banks
      { code: 'AUBL', name: 'AU Small Finance Bank', keywords: ['au', 'aubank', 'au small finance'] },
      { code: 'ESAF', name: 'ESAF Small Finance Bank', keywords: ['esaf'] },
      { code: 'EQTX', name: 'Equitas Small Finance Bank', keywords: ['equitas'] },
      { code: 'UJVN', name: 'Ujjivan Small Finance Bank', keywords: ['ujjivan'] },
      { code: 'JSFB', name: 'Jana Small Finance Bank', keywords: ['jana'] },
      { code: 'UTKS', name: 'Utkarsh Small Finance Bank', keywords: ['utkarsh'] },
      { code: 'SURY', name: 'Suryoday Small Finance Bank', keywords: ['suryoday'] },
      { code: 'CSBK', name: 'CSB Bank', keywords: ['csb', 'catholic syrian'] },
      { code: 'KVBL', name: 'Karur Vysya Bank', keywords: ['kvb', 'karur vysya'] },
      { code: 'KARB', name: 'Karnataka Bank', keywords: ['karnataka', 'kbl'] },
      { code: 'CIUB', name: 'City Union Bank', keywords: ['cub', 'city union'] },
      { code: 'TMBL', name: 'Tamilnad Mercantile Bank', keywords: ['tmb', 'tamilnad'] },
      { code: 'SIBL', name: 'South Indian Bank', keywords: ['sib', 'south indian'] },
      { code: 'DLXB', name: 'Dhanlaxmi Bank', keywords: ['dhanlaxmi'] },
      { code: 'JAKA', name: 'Jammu & Kashmir Bank', keywords: ['j&k', 'jk bank', 'kashmir'] },
      { code: 'NBL', name: 'Nainital Bank', keywords: ['nainital'] },
      { code: 'PYTM', name: 'Paytm Payments Bank', keywords: ['paytm', 'paytm bank'] },
      { code: 'AIRP', name: 'Airtel Payments Bank', keywords: ['airtel', 'airtel bank'] },
      { code: 'IPPB', name: 'India Post Payments Bank', keywords: ['post', 'ippb', 'post office'] },
      { code: 'FINO', name: 'Fino Payments Bank', keywords: ['fino'] },
      { code: 'JIOB', name: 'Jio Payments Bank', keywords: ['jio'] },

      // Foreign & MNC Banks Operating in India
      { code: 'SCBL', name: 'Standard Chartered Bank', keywords: ['standard chartered', 'stan chart', 'scb'] },
      { code: 'HSBC', name: 'HSBC Bank India', keywords: ['hsbc', 'hongkong shanghai'] },
      { code: 'CITI', name: 'Citibank India', keywords: ['citi', 'citibank'] },
      { code: 'DBSS', name: 'DBS Bank India', keywords: ['dbs', 'digibank'] },
      { code: 'DEUT', name: 'Deutsche Bank', keywords: ['deutsche'] },
      { code: 'BARC', name: 'Barclays Bank', keywords: ['barclays'] },
    ],
    []
  );

  const cleanQuery = searchQuery.toLowerCase().trim();

  const filteredBanks = useMemo(() => {
    if (!cleanQuery) return allBanks;
    return allBanks.filter((b) => {
      const matchName = b.name.toLowerCase().includes(cleanQuery);
      const matchCode = b.code.toLowerCase().includes(cleanQuery);
      const matchKeywords = b.keywords?.some((k) => k.toLowerCase().includes(cleanQuery));
      return matchName || matchCode || matchKeywords;
    });
  }, [allBanks, cleanQuery]);

  const selectedBankObj = useMemo(() => {
    if (!selectedBank) return null;
    return allBanks.find((b) => b.code === selectedBank) || {
      code: selectedBank,
      name: selectedBank.replace(/_/g, ' '),
    };
  }, [allBanks, selectedBank]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBank = (bank: BankItem) => {
    setSelectedBank(bank.code);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleCustomBankSelect = () => {
    if (!searchQuery.trim()) return;
    const customCode = searchQuery.trim().toUpperCase().replace(/\s+/g, '_');
    setSelectedBank(customCode);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBank('');
    setSearchQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-2 text-left" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-700">
        Select Bank <span className="text-purple-600 font-bold">*</span>
      </label>

      {/* Search Input Bar with click-to-open Dropdown */}
      <div className="relative">
        <div
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
          className={`w-full min-h-[42px] px-3 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
            isOpen
              ? 'bg-white border-purple-600 ring-2 ring-purple-600/20 shadow-sm'
              : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Building2 className={`w-4 h-4 shrink-0 ${selectedBank ? 'text-purple-600' : 'text-slate-400'}`} />

          {/* If open, show search input; if closed and selected, show selected bank */}
          {isOpen ? (
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search (e.g. SBI, HDFC, Canara, PNB, AU)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none"
              autoFocus
            />
          ) : selectedBankObj ? (
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{selectedBankObj.name}</span>
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Selected
              </span>
            </div>
          ) : (
            <span className="flex-1 text-xs text-slate-400">
              Click to search and select your bank...
            </span>
          )}

          {/* Action Icons: Clear / Dropdown Chevron */}
          <div className="flex items-center gap-1">
            {selectedBank && !isOpen && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                title="Change bank"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-purple-600' : ''
              }`}
            />
          </div>
        </div>

        {/* Dropdown Menu (Opens on click) */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto no-scrollbar divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {filteredBanks.map((bank) => {
              const isSelected = selectedBank === bank.code;
              return (
                <button
                  key={bank.code}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-purple-50 text-purple-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-purple-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Building2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-purple-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{bank.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
                </button>
              );
            })}

            {filteredBanks.length === 0 && searchQuery.trim() && (
              <div className="p-3.5 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  No standard match found for &quot;{searchQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={handleCustomBankSelect}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Select &quot;{searchQuery}&quot; as bank
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Direct redirect to your bank&apos;s 256-bit encrypted NetBanking gateway.</span>
      </div>
    </div>
  );
}
