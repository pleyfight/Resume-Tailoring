'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Shield, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen text-[#1B1712]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C29B6F]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-[#6E7B6C]/15 blur-3xl" />

        <nav className="relative z-10 border-b border-[#E4D7CA] bg-[#FFFCF7]/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8CBBE] bg-[#FFF9F1]">
                <Sparkles className="h-5 w-5 text-[#8B5B2B]" />
              </div>
              <div>
                <div className="font-serif text-xl font-semibold tracking-tight">Sleek</div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Resume Studio</div>
              </div>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-[#1B1712] bg-[#1B1712] px-5 py-2 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <main className="relative z-10 px-6 py-14">
          <div className="container mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E4D7CA] bg-[#FFFCF7] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6F6257]">
                Welcome back
              </div>
              <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                Your next tailored resume is waiting.
              </h1>
              <p className="text-lg text-[#6F6257]">
                Log in to keep refining your story, track versions, and stay ready for every opportunity.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />, text: "Private, user-only storage" },
                  { icon: <Shield className="h-4 w-4 text-[#8B5B2B]" />, text: "OWASP-aligned security" },
                  { icon: <Clock className="h-4 w-4 text-[#8B5B2B]" />, text: "Save drafts in minutes" },
                  { icon: <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />, text: "Resume history on demand" },
                ].map((item) => (
                  <div key={item.text} className="rounded-2xl border border-[#E4D7CA] bg-[#FFFCF7] p-4 text-sm text-[#1B1712]">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#E4D7CA] bg-[#FFFCF7] p-8 shadow-[0_20px_50px_rgba(20,16,12,0.12)]">
              <div className="mb-6">
                <h2 className="font-serif text-2xl">Log in</h2>
                <p className="mt-2 text-sm text-[#6F6257]">Use email or a connected provider.</p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1B1712]">
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B7B6C]" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] py-3 pl-11 pr-4 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="password" className="font-medium text-[#1B1712]">Password</label>
                    <Link href="/reset-password" className="text-[#8B5B2B] hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B7B6C]" />
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] py-3 pl-11 pr-4 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                      placeholder=""
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#6F6257]">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                    className="rounded border-[#D9CBBE]"
                  />
                  Remember me on this device
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1B1712] px-6 py-3 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C] disabled:cursor-not-allowed disabled:bg-[#CBB9A9]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFFCF7] border-t-transparent" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Log in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3 text-xs text-[#6F6257]">
                <div className="h-px flex-1 bg-[#E4D7CA]" />
                or continue with
                <div className="h-px flex-1 bg-[#E4D7CA]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => alert("Google OAuth will be implemented with backend!")}
                  className="rounded-2xl border border-[#D9CBBE] bg-[#FFFCF7] px-3 py-2 text-xs font-semibold text-[#1B1712] transition hover:-translate-y-0.5"
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => alert("Apple OAuth will be implemented with backend!")}
                  className="rounded-2xl border border-[#D9CBBE] bg-[#FFFCF7] px-3 py-2 text-xs font-semibold text-[#1B1712] transition hover:-translate-y-0.5"
                >
                  Apple
                </button>
                <button
                  type="button"
                  onClick={() => alert("LinkedIn OAuth will be implemented with backend!")}
                  className="rounded-2xl border border-[#D9CBBE] bg-[#FFFCF7] px-3 py-2 text-xs font-semibold text-[#1B1712] transition hover:-translate-y-0.5"
                >
                  LinkedIn
                </button>
              </div>

              <p className="mt-6 text-center text-xs text-[#6F6257]">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-[#8B5B2B] hover:underline">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
