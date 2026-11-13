import React, { useState } from 'react';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthPagesProps {
  onNavigate: (route: string) => void;
  defaultTab?: 'login' | 'register';
}

export const AuthPages: React.FC<AuthPagesProps> = ({ onNavigate, defaultTab = 'login' }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    isAuthenticated,
    isAdmin,
    isConfigured
  } = useAuth();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Automatically redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      onNavigate('/');
    }
  }, [isAuthenticated, onNavigate]);

  // If already authenticated, show a minimal loading or redirecting state
  if (isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <h2 className="text-sm font-bold text-gray-600">
          {language === 'en' ? 'Redirecting...' : 'প্রবেশ করা হচ্ছে...'}
        </h2>
      </div>
    );
  }

  // Handle Real Google Sign-In via Firebase
  const handleGoogleSignIn = async () => {
    if (isLoadingGoogle) return;
    setErrorMsg('');
    setInfoMsg('');
    setIsLoadingGoogle(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onNavigate('/');
      } else if (res.error) {
        setErrorMsg(res.error);
        console.error('Google Sign-In Result Error:', res.code, res.error);
      }
    } catch (e: any) {
      console.error('Unexpected Google Auth Error:', e);
      setErrorMsg(language === 'en' ? 'Failed to sign in with Google.' : 'গুগল সাইন-ইন করতে সমস্যা হয়েছে।');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Handle Email / Password Form Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(language === 'en' ? 'Please enter a valid email address.' : 'সঠিক ইমেইল ঠিকানা প্রদান করুন।');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(language === 'en' ? 'Password must be at least 6 characters.' : 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    setIsLoadingEmail(true);

    if (mode === 'login') {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        onNavigate('/');
      } else {
        setErrorMsg(res.error || (language === 'en' ? 'Invalid credentials.' : 'লগইন তথ্য সঠিক নয়।'));
      }
    } else {
      if (!name.trim()) {
        setErrorMsg(language === 'en' ? 'Please enter your full name.' : 'আপনার পুরো নাম লিখুন।');
        setIsLoadingEmail(false);
        return;
      }
      const res = await registerWithEmail(email, password, name);
      if (res.success) {
        onNavigate('/');
      } else {
        setErrorMsg(res.error || (language === 'en' ? 'Failed to create account.' : 'অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি।'));
      }
    }

    setIsLoadingEmail(false);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4 space-y-6 pb-24 md:pb-16">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {mode === 'login'
            ? (language === 'en' ? 'Welcome Back' : 'স্বাগতম')
            : (language === 'en' ? 'Create Account' : 'নতুন অ্যাকাউন্ট তৈরি করুন')}
        </h1>
        <p className="text-xs text-gray-500">
          {mode === 'login'
            ? (language === 'en' ? 'Sign in to access your orders and checkout' : 'অর্ডার ও কেনাকাটা সম্পন্ন করতে প্রবেশ করুন')
            : (language === 'en' ? 'Sign up with Google or Email' : 'গুগল অথবা ইমেইল দিয়ে সহজে অ্যাকাউন্ট খুলুন')}
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {t('sign_in')}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'register' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          {t('sign_up')}
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-sm space-y-5">
        {/* Official Google Sign-In Button (Standard Google Styling) */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-sm py-3 px-4 rounded-xl border border-gray-300 shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>
              {isLoadingGoogle
                ? (language === 'en' ? 'Signing in with Google...' : 'গুগলে কানেক্ট হচ্ছে...')
                : (language === 'en' ? 'Sign in with Google' : 'Google দিয়ে সাইন ইন করুন')}
            </span>
          </button>

          {/* New Tab Helper if inside preview iframe */}
          {typeof window !== 'undefined' && window.self !== window.top && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <span className="font-bold text-amber-900 shrink-0">💡 টিপস:</span>
              <span>
                আপনি যদি AI Studio-র এডিটরের ভেতরের প্রিভিউতে থাকেন, তবে গুগল সাইন-ইন করতে ওপরে ডানের <strong>নতুন ট্যাব আইকন (↗)</strong> বা ফুল স্ক্রিন বাটনে ট্যাপ করে মূল সাইটটি ব্রাউজারে খুলুন।
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">
              {language === 'en' ? 'or continue with email' : 'অথবা ইমেইল দিয়ে'}
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">
                {language === 'en' ? 'Full Name' : 'আপনার পুরো নাম'}
              </label>
              <input
                type="text"
                placeholder={language === 'en' ? 'e.g. John Doe' : 'যেমন: তানভীর আহমেদ'}
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-[#FAF7F0]/60 border border-[#ECE8DF] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-brand-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              {language === 'en' ? 'Email Address' : 'ইমেইল অ্যাড্রেস'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#FAF7F0]/60 border border-[#ECE8DF] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 block">
              {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#FAF7F0]/60 border border-[#ECE8DF] rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm focus:outline-hidden focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoadingEmail}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isLoadingEmail
              ? (language === 'en' ? 'Processing...' : 'প্রক্রিয়াধীন...')
              : mode === 'login'
              ? (language === 'en' ? 'Sign In' : 'লগইন করুন')
              : (language === 'en' ? 'Create Account' : 'রেজিস্ট্রেশন করুন')}
          </button>
        </form>
      </div>
    </div>
  );
};
