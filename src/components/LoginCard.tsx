import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { BananaLogo } from './BananaLogo';

interface LoginCardProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@bakedbydoja.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('admin@bakedbydoja.com');
  const [forgotStatus, setForgotStatus] = useState<{ loading: boolean; msg?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your admin email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      setSuccessMsg('Authentication verified. Welcome back!');
      
      // Store auth session
      if (rememberMe) {
        localStorage.setItem('bbd_admin_token', data.token);
        localStorage.setItem('bbd_admin_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('bbd_admin_token', data.token);
        sessionStorage.setItem('bbd_admin_user', JSON.stringify(data.user));
      }

      // Delay briefly for polished transition
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to authentication server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotStatus({ loading: true });

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setForgotStatus({ loading: false, msg: data.message });
      } else {
        setForgotStatus({ loading: false, error: data.error || 'Failed to send reset link.' });
      }
    } catch {
      setForgotStatus({ loading: false, error: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="relative w-full lg:w-1/2 min-h-screen bg-[#FBF9F5] flex flex-col justify-between items-center p-6 sm:p-10 lg:p-12">
      {/* Top Right Security Indicator */}
      <div className="w-full flex justify-end mb-4 sm:mb-8">
        <div className="flex items-center gap-2.5 text-right select-none">
          <ShieldCheck className="w-4 h-4 text-[#475569] stroke-[2]" />
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#18243A] leading-tight">
              Secure Admin Access
            </span>
            <span className="text-[11px] text-[#64748B] leading-tight">
              Only authorized personnel can login
            </span>
          </div>
        </div>
      </div>

      {/* Main Centered Login Card */}
      <div className="w-full max-w-[460px] my-auto">
        <div className="bg-white rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-15px_rgba(43,27,18,0.07)] border border-[#ECE7DC] relative">
          
          {/* Card Header Brand Logo */}
          <div className="flex justify-center mb-6">
            <BananaLogo size="md" centered />
          </div>

          {/* Heading */}
          <div className="text-center mb-7">
            <h2 className="text-2xl sm:text-[27px] font-bold text-[#18243A] tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-semibold text-[#18243A] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Mail className="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bakedbydoja.com"
                  autoComplete="email"
                  required
                  className="w-full h-12 pl-10 pr-3.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#18243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B914] focus:ring-3 focus:ring-[#F9B914]/20 transition-all font-normal"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[#18243A] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Lock className="w-4 h-4 stroke-[1.8]" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full h-12 pl-10 pr-11 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#18243A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F9B914] focus:ring-3 focus:ring-[#F9B914]/20 transition-all font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 accent-[#2563EB] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#475569]">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email || 'admin@bakedbydoja.com');
                  setForgotStatus(null);
                  setIsForgotOpen(true);
                }}
                className="text-xs font-semibold text-[#0D8B68] hover:underline focus:outline-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] bg-[#F9B914] hover:bg-[#ECAE0E] active:scale-[0.99] text-[#18243A] font-bold text-sm tracking-wide rounded-xl shadow-md shadow-[#F9B914]/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#18243A]" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

            {/* Divider OR */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] font-bold text-[#94A3B8] tracking-widest uppercase">
                OR
              </span>
            </div>

            {/* Security Notice Box */}
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3.5 flex items-start gap-3">
              <Lock className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                This is a private admin area. All activities are monitored and secured.
              </p>
            </div>
          </form>

          {/* Quick Demo Assist Tooltip */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-[#F9B914]" />
              Authorized: admin@bakedbydoja.com
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@bakedbydoja.com');
              }}
              className="text-[#0D8B68] hover:underline font-medium cursor-pointer"
            >
              Fill Email
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Footer Notice */}
      <div className="text-center text-[11px] text-[#94A3B8] select-none py-2">
        © 2026 Baked by Doja Inc. All rights reserved.
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-[#18243A] mb-1">
              Reset Admin Password
            </h3>
            <p className="text-xs text-[#64748B] mb-4">
              Enter your authorized admin email address to receive password recovery instructions.
            </p>

            {forgotStatus?.msg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs">
                {forgotStatus.msg}
              </div>
            )}

            {forgotStatus?.error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs">
                {forgotStatus.error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#18243A] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-xs text-[#18243A] focus:border-[#F9B914] focus:ring-2 focus:ring-[#F9B914]/20 outline-none"
                  placeholder="admin@bakedbydoja.com"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={forgotStatus?.loading}
                  className="px-4 py-2 text-xs font-bold text-[#18243A] bg-[#F9B914] hover:bg-[#ECAE0E] rounded-lg shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {forgotStatus?.loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
