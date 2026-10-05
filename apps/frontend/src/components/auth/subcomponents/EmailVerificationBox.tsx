'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, AlertCircle, Loader2, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { isPublicEmail } from '@/lib/email-validator';
import { useToast } from '@/components/ui/Toast';

interface EmailVerificationBoxProps {
  email: string;
  role: 'BRAND' | 'INFLUENCER';
  isVerified: boolean;
  setIsVerified: (val: boolean) => void;
  onVerificationSuccess?: (token?: string) => void;
  onResetEmail?: () => void;
}

export default function EmailVerificationBox({
  email,
  role,
  isVerified,
  setIsVerified,
  onVerificationSuccess,
  onResetEmail,
}: EmailVerificationBoxProps) {
  const { toastSuccess, toastError } = useToast();
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const isBrand = role === 'BRAND';
  const hasPublicDomain = isBrand && isPublicEmail(email);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleSendOtp = async () => {
    setDevCode(null);

    if (!email || !email.includes('@')) {
      toastError('Please enter a valid email address first.', 'Invalid Email');
      return;
    }

    if (hasPublicDomain) {
      toastError('Brands must use an official business email (e.g. name@company.com). Public domains like @gmail.com or @yahoo.com are not permitted.', 'Business Email Required');
      return;
    }

    setSendingOtp(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/send-verification-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Failed to send verification code. Please try again.');
      }

      setOtpSent(true);
      toastSuccess(data.message || `Verification code sent to ${email}!`, 'OTP Sent');
      if (process.env.NODE_ENV !== 'production' && data.devCode) {
        setDevCode(data.devCode);
      }
      setResendCountdown(60);
    } catch (err: any) {
      toastError(err.message || 'Error sending code.', 'Sending Failed');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toastError('Please enter the 6-digit verification code received in your email.', 'Code Required');
      return;
    }

    setVerifyingOtp(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otpCode.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'Invalid verification code. Please check and try again.');
      }

      setIsVerified(true);
      setOtpSent(false);
      toastSuccess('Email verified successfully! You can continue.', 'Verified');
      if (onVerificationSuccess) {
        onVerificationSuccess(data.verificationToken);
      }
    } catch (err: any) {
      toastError(err.message || 'Verification failed. Please check the code.', 'Verification Error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleQuickPasteDevCode = () => {
    if (devCode) {
      setOtpCode(devCode);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Verified State Display */}
      {isVerified ? (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs shadow-inner">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">
              {isBrand ? 'Official Business Email Verified' : 'Email Verified'}
            </span>
          </div>
          {onResetEmail && (
            <button
              type="button"
              onClick={onResetEmail}
              className="text-[11px] font-bold text-slate-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Change
            </button>
          )}
        </div>
      ) : (
        /* Action Button when not yet verified */
        <div className="flex items-center justify-end">
          <button
            type="button"
            disabled={sendingOtp || !email || hasPublicDomain}
            onClick={handleSendOtp}
            className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-[11px] font-bold text-purple-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {sendingOtp ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-purple-300" />
                <span>Sending Code...</span>
              </>
            ) : (
              <>
                <Mail className="w-3 h-3 text-purple-300" />
                <span>{otpSent ? 'Resend Code' : 'Verify Email'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Public domain warning for Brands */}
      {hasPublicDomain && !isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold">Work email required:</span> Zerify Brands cannot register with public email providers (@gmail, @yahoo, @hotmail, etc.). Please enter your company domain email (e.g. name@brand.com).
          </p>
        </motion.div>
      )}

      {/* OTP Input Card */}
      <AnimatePresence>
        {otpSent && !isVerified && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-xl space-y-3 overflow-hidden backdrop-blur-md"
          >
            <div className="flex items-center justify-between text-xs text-purple-200">
              <span className="flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                <span>Enter 6-digit code sent to your email:</span>
              </span>
              {resendCountdown > 0 ? (
                <span className="text-[10px] text-slate-400 font-mono">
                  Resend in {resendCountdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="text-[11px] font-bold text-purple-300 hover:text-purple-100 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend</span>
                </button>
              )}
            </div>

            {/* Dev helper badge if devCode returned (strictly development only) */}
            {process.env.NODE_ENV !== 'production' && devCode && (
              <button
                type="button"
                onClick={handleQuickPasteDevCode}
                className="w-full py-1 px-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-[11px] text-indigo-300 flex items-center justify-between hover:bg-indigo-500/25 transition-all text-left cursor-pointer"
              >
                <span className="flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Dev Helper OTP: <span className="font-bold text-white tracking-widest">{devCode}</span>
                </span>
                <span className="text-[10px] text-indigo-300 underline font-medium">Auto-Fill</span>
              </button>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-sm text-center text-white font-mono tracking-[0.4em] font-bold outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-600"
              />
              <button
                type="button"
                disabled={verifyingOtp || otpCode.length !== 6}
                onClick={handleVerifyOtp}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-purple-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
