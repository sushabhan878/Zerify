'use client';

import React from 'react';
import { QrCode, ShieldCheck, Smartphone, CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';

interface UpiPaymentTabProps {
  upiId: string;
  setUpiId: (val: string) => void;
  savedUpiIds?: string[];
  selectedSavedUpi?: string | null;
  onSelectSavedUpi?: (id: string) => void;
  isEnteringNewUpi?: boolean;
  setIsEnteringNewUpi?: (entering: boolean) => void;
  saveUpiChoice: boolean;
  setSaveUpiChoice: (save: boolean) => void;
  onDeleteSavedUpi?: (id: string) => void;
  showQrCode: boolean;
  setShowQrCode: (show: boolean) => void;
  amountFormatted: string;
}

export default function UpiPaymentTab({
  upiId,
  setUpiId,
  savedUpiIds = [],
  selectedSavedUpi,
  onSelectSavedUpi,
  isEnteringNewUpi = false,
  setIsEnteringNewUpi,
  saveUpiChoice,
  setSaveUpiChoice,
  onDeleteSavedUpi,
  showQrCode,
  setShowQrCode,
  amountFormatted,
}: UpiPaymentTabProps) {
  const hasSaved = savedUpiIds && savedUpiIds.length > 0;

  return (
    <div className="space-y-3 text-left">
      {/* Switch between VPA and QR Code */}
      <div className="flex items-center justify-between p-0.5 bg-slate-100 rounded-lg">
        <button
          type="button"
          onClick={() => setShowQrCode(false)}
          className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-bold transition-all ${
            !showQrCode ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          UPI ID / VPA
        </button>
        <button
          type="button"
          onClick={() => setShowQrCode(true)}
          className={`flex-1 py-1.5 px-3 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
            showQrCode ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Dynamic QR Code</span>
        </button>
      </div>

      {showQrCode ? (
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col items-center text-center space-y-2.5">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-900 to-indigo-950 p-2 rounded-lg flex flex-col items-center justify-center text-white relative">
              <QrCode className="w-24 h-24 text-white stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-2 py-0.5 rounded bg-purple-600 text-[10px] font-black uppercase tracking-wider text-white border border-white shadow">
                  ₹ {amountFormatted}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">Scan with any UPI App to Pay</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Supports Google Pay, PhonePe, Paytm, Cred, BHIM & all Indian Bank UPI apps.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* 1. SAVED UPI IDs SECTION (If any exist) */}
          {hasSaved && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Saved UPI Accounts
                </span>
                <span className="text-[10px] text-purple-600 font-semibold">1-Click Direct Collect</span>
              </div>

              <div className="space-y-1.5">
                {savedUpiIds.map((saved) => {
                  const isSelected = !isEnteringNewUpi && (selectedSavedUpi === saved || upiId === saved);
                  return (
                    <div
                      key={saved}
                      onClick={() => {
                        setIsEnteringNewUpi?.(false);
                        onSelectSavedUpi?.(saved);
                      }}
                      className={`group flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-purple-50/80 border-purple-500 ring-1 ring-purple-500/20 shadow-sm'
                          : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Radio Indicator */}
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-600 text-white'
                              : 'border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        <div className="flex items-center gap-1.5 min-w-0">
                          <Smartphone className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-600' : 'text-slate-400'}`} />
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>
                            {saved}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Saved
                        </span>
                        {onDeleteSavedUpi && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSavedUpi(saved);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors"
                            title="Remove saved UPI ID"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Option to use a different / new UPI ID */}
                <div
                  onClick={() => setIsEnteringNewUpi?.(true)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border border-dashed cursor-pointer transition-all ${
                    isEnteringNewUpi
                      ? 'bg-purple-50/40 border-purple-400 text-purple-700'
                      : 'bg-transparent border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isEnteringNewUpi
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isEnteringNewUpi && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Pay with another UPI ID</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. NEW UPI ID INPUT FORM (Show if no saved or user toggled new) */}
          {(!hasSaved || isEnteringNewUpi) && (
            <div className="space-y-2 pt-1 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-700">
                UPI ID / Virtual Payment Address (VPA) <span className="text-purple-600 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or yourname@okhdfcbank"
                  className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all"
                  required={isEnteringNewUpi || !hasSaved}
                />
              </div>

              {/* RADIO BUTTON / CHECKBOX TO SAVE UPI ID FOR FUTURE */}
              <label
                className="flex items-center gap-2 py-1 px-1 text-slate-700 hover:text-slate-900 cursor-pointer select-none group"
                onClick={() => setSaveUpiChoice(!saveUpiChoice)}
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    saveUpiChoice
                      ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {saveUpiChoice && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span className="text-[11px] font-bold text-slate-700 group-hover:text-purple-900">
                  Save this UPI ID for faster 1-click checkout in future
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Instant UPI verification powered by Cashfree Gateway. 0% transaction fee.</span>
      </div>
    </div>
  );
}
