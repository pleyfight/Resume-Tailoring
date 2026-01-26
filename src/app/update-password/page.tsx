'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;
      setHasSession(!!session);
      setIsReady(true);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setHasSession(!!session);
      setIsReady(true);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace('/dashboard');
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

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-[#2D2D2D] mb-2">
              Set a new password
            </h1>
            <p className="text-[#6B6B6B]">
              Choose a strong password you’ll remember
            </p>
          </div>

          {!isReady ? (
            <div className="bg-white rounded-xl shadow-lg border border-[#E5E5E5] p-8 text-center text-[#6B6B6B]">
              Loading...
            </div>
          ) : !hasSession ? (
            <div className="bg-white rounded-xl shadow-lg border border-[#E5E5E5] p-8">
              <div className="text-[#2D2D2D] font-medium mb-2">This link is invalid or expired.</div>
              <p className="text-[#6B6B6B] text-sm mb-6">
                Request a new password reset email, then open the latest link.
              </p>
              <Link
                href="/reset-password"
                className="inline-block w-full text-center py-3 px-6 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium"
              >
                Send a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-[#E5E5E5] p-8">
              {errorMessage && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#2D2D2D] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-[#D1D1D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2D2D2D] mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999]" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-[#D1D1D1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D2D2D] focus:border-transparent"
                      placeholder=""
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-[#2D2D2D] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-[#D1D1D1] disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Password
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

