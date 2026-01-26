'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex flex-col">
      {/* Header */}
      <nav className="border-b border-[#E5E5E5] bg-white">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Sparkles className="w-6 h-6 text-[#2D2D2D]" />
            <span className="font-serif text-2xl font-bold text-[#2D2D2D]">Sleek</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-serif text-4xl font-bold text-[#2D2D2D] mb-2">
                  Reset your password
                </h1>
                <p className="text-[#6B6B6B]">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-[#E5E5E5] p-8">
                {errorMessage && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#2D2D2D] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-[#D1D1D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-[#D1D1D1] disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Back to Login */}
              <p className="text-center mt-6 text-[#6B6B6B]">
                Remember your password?{' '}
                <Link href="/login" className="text-[#2D2D2D] font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="bg-white rounded-xl shadow-lg border border-[#E5E5E5] p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="font-serif text-3xl font-bold text-[#2D2D2D] mb-3">
                  Check your email
                </h1>
                <p className="text-[#6B6B6B] mb-6">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <div className="bg-[#F7F5F3] rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#6B6B6B]">
                    <strong>Didn't receive the email?</strong> Check your spam folder or{' '}
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-[#2D2D2D] font-medium hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-block px-6 py-3 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

