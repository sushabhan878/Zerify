'use client';

import React from 'react';
import { QrCode, ShieldCheck, Smartphone } from 'lucide-react';

interface UpiPaymentTabProps {
  upiId: string;
  setUpiId: (val: string) => void;
  selectedUpiApp?: string;
  setSelectedUpiApp?: (app: string) => void;
  showQrCode: boolean;
  setShowQrCode: (show: boolean) => void;
  amountFormatted: string;
}

export default function UpiPaymentTab({
  upiId,
  setUpiId,
  showQrCode,
  setShowQrCode,
  amountFormatted,
}: UpiPaymentTabProps) {
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
        <div className="space-y-1.5">
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
              placeholder="e.g. yourname@upi or 9876543210@paytm"
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 transition-all"
              required
            />
          </div>
          <p className="text-[10px] text-slate-500 pt-0.5">
            Enter your UPI handle registered with any Indian payment application.
          </p>
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Instant UPI verification powered by Cashfree Gateway. 0% transaction fee.</span>
      </div>
    </div>
  );
}
