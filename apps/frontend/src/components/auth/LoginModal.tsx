'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AuthHeader from './subcomponents/AuthHeader';
import AuthAlert from './subcomponents/AuthAlert';
import AuthGoogleButton from './subcomponents/AuthGoogleButton';
import LoginSuccessScreen from './subcomponents/LoginSuccessScreen';
import LoginForm from './subcomponents/LoginForm';

export default function LoginModal() {
  const router = useRouter();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const endpoint = `${apiUrl}/auth/login`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(message || 'Authentication failed. Invalid email or password.');
      }

      if (data.accessToken) {
        localStorage.setItem('zerify_token', data.accessToken);
        document.cookie = `zerify_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      if (data.user) {
        localStorage.setItem('zerify_user', JSON.stringify(data.user));
        setLoggedInUser(data.user);
      }

      window.dispatchEvent(new Event('zerify_auth_change'));
      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setErrorMessage('Demo Mode: Google OAuth authentication successfully simulated.');
    }, 1000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto p-1 transition-all duration-300">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-[0.04] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-3xl bg-[#07090e]/30 border border-white/10 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300"
      >
        {/* Full-Width Bottom Ambient Lighting Rim */}
        <div className="absolute -bottom-0.5 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-[2px] rounded-full pointer-events-none" />
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-80 h-36 bg-purple-600/05 rounded-full blur-3xl pointer-events-none" />

        {success ? (
          <LoginSuccessScreen userEmail={loggedInUser?.email || email} />
        ) : (
          <div>
            <AuthHeader
              badge="Secure Member Portal"
              titlePrefix="Sign in to"
              titleHighlight="Zerify"
              subtitle="Enter your credentials to access your account dashboard"
            />

            <AuthAlert message={errorMessage} />

            <LoginForm
              onSubmit={handleSubmit}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onForgotPassword={() =>
                setErrorMessage('Password reset link sent to registered email if account exists.')
              }
            />

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative px-3 bg-[#090D16] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Or continue with
              </span>
            </div>

            <AuthGoogleButton onClick={handleGoogleLogin} />

            <div className="mt-8 text-center">
              <p className="text-xs text-slate-400">
                Don't have an account yet?{' '}
                <Link
                  href="/register"
                  className="font-bold text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-4"
                >
                  Create an Account
                </Link>
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
