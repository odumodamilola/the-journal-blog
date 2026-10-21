'use client';

import React, { useState } from 'react';
import { Terminal, ArrowLeft, Info, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
  onBackToJournal: () => void;
}

export function LoginView({ onSuccess, onBackToJournal }: LoginViewProps) {
  const [email, setEmail] = useState('editor@thejournal.press');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate instant authenticating for editorial credentials
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface text-on-surface antialiased">
      {/* Left Column: Editorial Brand Panel (50% desktop) */}
      <div className="relative w-full md:w-1/2 bg-[#18231D] text-inverse-on-surface flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden border-b md:border-b-0 md:border-r border-outline-variant/20">
        {/* Architectural Framing / Subtle Glows */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute inset-6 md:inset-10 border border-primary-container/20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
        </div>

        {/* Top Header / Monogram */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-editorial-headline text-2xl font-bold border border-white/20 shadow-md shrink-0">
            J
          </div>
          <div>
            <span className="font-editorial-headline text-2xl font-medium tracking-tight text-white">
              The Journal
            </span>
            <span className="block text-[11px] text-[#BEC9C1] font-normal tracking-wider uppercase">
              EDITORIAL ATELIER
            </span>
          </div>
        </div>

        {/* Center Feature: Editorial Typography & Micro Quote Card */}
        <div className="relative z-10 my-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/30 border border-primary-fixed-dim/30 text-primary-fixed mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase">
              Admin Terminal
            </span>
          </div>

          <h1 className="font-editorial-headline text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight mb-5">
            Every great story starts somewhere.
          </h1>

          <p className="font-editorial-headline italic text-lg sm:text-xl text-white/80 font-light mb-8 max-w-lg">
            Your ideas, your voice, your space to publish.
          </p>

          {/* Archival print-maker card */}
          <div className="border-l-2 border-primary-container pl-4 py-2 bg-white/5 rounded-r-lg pr-4 backdrop-blur-xs">
            <div className="flex items-center justify-between text-[#BEC9C1] text-sm mb-1">
              <span className="italic font-editorial-headline text-base">
                “Quiet minds craft enduring literature.”
              </span>
              <span className="text-xs text-primary-fixed/90 font-mono">№ 09</span>
            </div>
            <p className="text-[11px] text-[#BEC9C1]/80 tracking-wider uppercase">
              Volume IX · Autumn Edition
            </p>
          </div>
        </div>

        {/* Bottom Panel Note */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#BEC9C1] gap-2">
          <span>The Journal Editorial Content Engine</span>
          <span className="inline-flex items-center gap-1.5 text-primary-fixed/90 font-mono text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            Single Author Protocol
          </span>
        </div>
      </div>

      {/* Right Column: Login Form Canvas (50% desktop) */}
      <div className="w-full md:w-1/2 bg-surface flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Top Bar: Return Link */}
        <div className="flex justify-between items-center w-full">
          <button
            onClick={onBackToJournal}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors py-1 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to the Journal</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/30 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>System Live</span>
          </div>
        </div>

        {/* Centered Card Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {/* Header Section */}
          <div className="mb-6 text-left">
            <h2 className="font-editorial-headline text-3xl font-medium text-on-surface mb-1.5">
              Welcome back
            </h2>
            <p className="text-sm text-on-surface-variant">
              Sign in to manage your journal publications and essays.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-container/40 border border-error/30 text-error text-xs">
              {error}
            </div>
          )}

          {/* Form Elements */}
          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label
                className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-3.5 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="editor@thejournal.press"
              />
              <div className="flex items-center gap-1 text-on-surface-variant text-[11px] pl-0.5 pt-0.5">
                <Info className="w-3.5 h-3.5" />
                <span>Pre-configured with registered editor credentials</span>
              </div>
            </div>

            {/* Password Field with Visibility Toggle */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-on-surface"
                  htmlFor="password"
                >
                  Password
                </label>
                <span className="text-[11px] text-secondary">
                  Demo credentials preloaded
                </span>
              </div>

              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Session Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container"
                />
                <span className="text-xs text-on-surface-variant font-medium">
                  Stay signed in for 30 days
                </span>
              </label>
            </div>

            {/* Primary CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-primary-container hover:bg-primary active:scale-[0.99] text-on-primary text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-70"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Authenticating...' : 'Sign In to Studio'}</span>
              </button>
            </div>
          </form>

          {/* Security Badge Indicator */}
          <div className="mt-8 pt-4 border-t border-outline-variant/30 flex items-center justify-center gap-2 text-on-surface-variant">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-[11px] text-center font-medium">
              Protected by Supabase Server-Side Authorization
            </span>
          </div>
        </div>

        {/* Form Footer Copyright */}
        <div className="w-full text-center text-outline text-[11px] pt-4">
          © 2026 The Journal Publishing Co. Dedicated editorial workspace.
        </div>
      </div>
    </div>
  );
}
