'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RegisterProgressHeader from './subcomponents/RegisterProgressHeader';
import RegisterRoleStep from './subcomponents/RegisterRoleStep';
import RegisterCredentialsStep from './subcomponents/RegisterCredentialsStep';
import RegisterBrandStep from './subcomponents/RegisterBrandStep';
import RegisterInfluencerStep from './subcomponents/RegisterInfluencerStep';
import RegisterSuccessScreen from './subcomponents/RegisterSuccessScreen';

export default function RegisterModal() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<'BRAND' | 'INFLUENCER'>('INFLUENCER');

  // Auth Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Brand fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Influencer fields
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [category, setCategory] = useState('Fashion & Beauty');
  const [gender, setGender] = useState('Prefer not to say');
  const [openToAffiliate, setOpenToAffiliate] = useState(false);
  const [openToUgc, setOpenToUgc] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [pricingRange, setPricingRange] = useState('$100 - $500');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (selectedRole: 'BRAND' | 'INFLUENCER') => {
    setRole(selectedRole);
    setErrorMessage('');
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!companyName) setCompanyName(fullName ? `${fullName}'s Brand` : '');
    if (!handle) setHandle(`@${fullName.toLowerCase().replace(/\s+/g, '') || 'creator'}`);

    setStep(3);
  };

  const handleGoogleRegister = () => {
    if (!fullName) setFullName('Google User');
    if (!email) setEmail('user@gmail.com');
    if (!companyName) setCompanyName('Google Business');
    if (!handle) setHandle('@googleuser');
    setStep(3);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const endpoint = role === 'BRAND' ? `${apiUrl}/auth/brand/register` : `${apiUrl}/auth/influencer/register`;

      const payload =
        role === 'BRAND'
          ? {
              email,
              password,
              name: fullName,
              companyName: companyName || fullName || 'My Brand',
              website: website || undefined,
            }
          : {
              email,
              password,
              name: fullName,
              handle: handle.startsWith('@') ? handle : `@${handle}`,
              platform,
              category,
              gender,
              openToAffiliate,
              openToUgc,
              contactInfo: contactInfo || undefined,
              pricingRange,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorText = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(errorText || 'Registration failed. Please check your credentials.');
      }

      if (data.accessToken) {
        localStorage.setItem('zerify_token', data.accessToken);
      }
      if (data.user) {
        localStorage.setItem('zerify_user', JSON.stringify(data.user));
      }

      window.dispatchEvent(new Event('zerify_auth_change'));
      setStep(4);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-1">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl blur-xl opacity-30 animate-pulse pointer-events-none" />

      <div className="relative rounded-3xl bg-slate-950/90 border border-white/10 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        <RegisterProgressHeader step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && <RegisterRoleStep role={role} onSelectRole={handleSelectRole} />}

          {step === 2 && (
            <RegisterCredentialsStep
              role={role}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              errorMessage={errorMessage}
              onSubmit={handleStep2Submit}
              onBack={() => setStep(1)}
              onGoogleRegister={handleGoogleRegister}
            />
          )}

          {step === 3 && role === 'BRAND' && (
            <RegisterBrandStep
              companyName={companyName}
              setCompanyName={setCompanyName}
              website={website}
              setWebsite={setWebsite}
              loading={loading}
              errorMessage={errorMessage}
              onSubmit={handleCompleteRegistration}
              onBack={() => setStep(2)}
            />
          )}

          {step === 3 && role === 'INFLUENCER' && (
            <RegisterInfluencerStep
              handle={handle}
              setHandle={setHandle}
              platform={platform}
              setPlatform={setPlatform}
              category={category}
              setCategory={setCategory}
              gender={gender}
              setGender={setGender}
              openToAffiliate={openToAffiliate}
              setOpenToAffiliate={setOpenToAffiliate}
              openToUgc={openToUgc}
              setOpenToUgc={setOpenToUgc}
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              pricingRange={pricingRange}
              setPricingRange={setPricingRange}
              loading={loading}
              errorMessage={errorMessage}
              onSubmit={handleCompleteRegistration}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && <RegisterSuccessScreen role={role} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
