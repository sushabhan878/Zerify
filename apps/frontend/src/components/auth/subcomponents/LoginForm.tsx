'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onForgotPassword: () => void;
}

export default function LoginForm({
  onSubmit,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onForgotPassword,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 light:text-slate-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 light:bg-slate-50 border border-white/10 light:border-slate-200/90 focus:border-purple-500 light:focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 light:focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {/* Password Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-300 light:text-slate-700">
            Password
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword();
            }}
            className="text-[11px] font-medium text-purple-400 light:text-purple-600 hover:text-purple-300 light:hover:text-purple-700 transition-colors"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 light:text-slate-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 light:bg-slate-50 border border-white/10 light:border-slate-200/90 focus:border-purple-500 light:focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-white light:text-slate-900 placeholder-slate-500 light:placeholder-slate-400 light:focus:bg-white outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 light:text-slate-400 hover:text-slate-300 light:hover:text-slate-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded bg-slate-900 light:bg-slate-100 border-white/20 light:border-slate-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-950"
          />
          <span className="text-xs text-slate-400 light:text-slate-600">Remember session on this device</span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white keep-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 mt-2 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-white keep-white" />
            <span className="text-white keep-white">Authenticating...</span>
          </>
        ) : (
          <>
            <span className="text-white keep-white">Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4 text-white keep-white" />
          </>
        )}
      </button>
    </form>
  );
}
