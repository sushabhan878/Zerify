'use client';

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RegisterProgressHeader from './subcomponents/RegisterProgressHeader';
import RegisterRoleStep from './subcomponents/RegisterRoleStep';
import RegisterCredentialsStep from './subcomponents/RegisterCredentialsStep';
import RegisterBrandStep from './subcomponents/RegisterBrandStep';
import RegisterInfluencerStep from './subcomponents/RegisterInfluencerStep';
import RegisterSuccessScreen from './subcomponents/RegisterSuccessScreen';
import { isPublicEmail } from '@/lib/email-validator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface RegisterModalProps {
  step?: 1 | 2 | 3 | 4;
  setStep?: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
}

export default function RegisterModal({
  step: externalStep,
  setStep: externalSetStep,
  onStepChange,
}: RegisterModalProps = {}) {
  const router = useRouter();
  const { toastSuccess } = useToast();
  const [internalStep, setInternalStep] = useState<1 | 2 | 3 | 4>(1);
  const step = externalStep !== undefined ? externalStep : internalStep;

  const setStep = (newStepAction: 1 | 2 | 3 | 4 | ((prev: 1 | 2 | 3 | 4) => 1 | 2 | 3 | 4)) => {
    const nextStep = typeof newStepAction === 'function' ? newStepAction(step) : newStepAction;
    if (externalSetStep) {
      externalSetStep(nextStep);
    } else {
      setInternalStep(nextStep);
    }
    if (onStepChange) {
      onStepChange(nextStep);
    }
  };

  const [role, setRole] = useState<'BRAND' | 'INFLUENCER'>('INFLUENCER');

  // Auth Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | undefined>(undefined);

  const [currency, setCurrency] = useState<string>('INR');

  // Brand fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [budget, setBudget] = useState(500000);

  // Influencer fields
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [category, setCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pricePerReel, setPricePerReel] = useState(20000);
  const [gender, setGender] = useState('Prefer not to say');
  const [openToAffiliate, setOpenToAffiliate] = useState(false);
  const [openToUgc, setOpenToUgc] = useState(false);
  const [contactInfo, setContactInfo] = useState('');
  const [pricingRange, setPricingRange] = useState('₹10,000 - ₹50,000');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectRole = (selectedRole: 'BRAND' | 'INFLUENCER') => {
    setRole(selectedRole);
    setEmailVerified(false);
    setVerificationToken(undefined);
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

    if (role === 'BRAND' && isPublicEmail(email)) {
      setErrorMessage('Brands must register with an official business email (e.g. name@company.com). Public domains like @gmail.com or @yahoo.com are not permitted.');
      return;
    }

    if (!emailVerified) {
      setErrorMessage('Please verify your email address with the 6-digit verification code before proceeding.');
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
    if (!email) setEmail(role === 'BRAND' ? 'partner@googlecorp.com' : 'creator@gmail.com');
    if (!companyName) setCompanyName('Google Business');
    if (!handle) setHandle('@googleuser');
    setEmailVerified(true);
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
            currency,
            budget,
          }
          : {
            email,
            password,
            name: fullName,
            handle: handle.startsWith('@') ? handle : `@${handle}`,
            platform,
            category: selectedCategories[0] || 'General',
            niches: selectedCategories,
            gender,
            openToAffiliate,
            openToUgc,
            contactInfo: contactInfo || undefined,
            pricingRange,
            currency,
            minPricePerReel: pricePerReel,
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
        document.cookie = `zerify_token=${data.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      if (data.user) {
        localStorage.setItem('zerify_user', JSON.stringify(data.user));
      }
      localStorage.setItem('zerify_preferred_currency', currency);

      window.dispatchEvent(new Event('zerify_auth_change'));
      toastSuccess('Account created successfully! Redirecting to your dashboard...', 'Welcome to Zerify');
      setStep(4);
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative w-full mx-auto p-1 transition-all duration-300 ${step === 1 ? 'max-w-3xl sm:max-w-4xl' : 'max-w-lg'}`}>
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-3xl blur-xl opacity-[0.04] pointer-events-none" />

      <div className="relative rounded-3xl bg-[#07090e]/30 border border-white/10 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden transition-all duration-300">
        <RegisterProgressHeader step={step} />

        <AnimatePresence mode="wait">
          {step === 1 && <RegisterRoleStep role={role} onSelectRole={handleSelectRole} />}

          {step === 2 && (
            <RegisterCredentialsStep
              role={role}
              companyName={companyName}
              setCompanyName={setCompanyName}
              fullName={fullName}
              setFullName={setFullName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              emailVerified={emailVerified}
              setEmailVerified={setEmailVerified}
              onVerificationTokenChange={setVerificationToken}
              errorMessage={errorMessage}
              onSubmit={handleStep2Submit}
              onBack={() => setStep(1)}
              onGoogleRegister={handleGoogleRegister}
            />
          )}

          {step === 3 && role === 'BRAND' && (
            <RegisterBrandStep
              website={website}
              setWebsite={setWebsite}
              budget={budget}
              setBudget={setBudget}
              currency={currency}
              setCurrency={setCurrency}
              loading={loading}
              errorMessage={errorMessage}
              onSubmit={handleCompleteRegistration}
              onBack={() => setStep(2)}
            />
          )}

          {step === 3 && role === 'INFLUENCER' && (
            <RegisterInfluencerStep
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              pricePerReel={pricePerReel}
              setPricePerReel={setPricePerReel}
              currency={currency}
              setCurrency={setCurrency}
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
