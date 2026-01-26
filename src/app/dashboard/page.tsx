"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, CreditCard, History, Trash2 } from "lucide-react";
import { IngestionForm } from "@/components/IngestionForm";
import { JobTargetInput } from "@/components/JobTargetInput";
import { ResumeViewer } from "@/components/ResumeViewer";
import { supabase } from "@/lib/supabase";

interface FormData {
  profile: {
    full_name: string;
    date_of_birth: string;
    phone: string;
    email: string;
    linkedin_url: string;
    portfolio_url: string;
    summary_bio: string;
  };
  work_experiences: any[];
  educations: any[];
  skills: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [generatedResume, setGeneratedResume] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useDocuments, setUseDocuments] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleFormDataChange = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session) {
        router.replace("/login");
        return;
      }

      setUserEmail(session.user.email ?? null);
      setIsAuthChecked(true);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setErrorMessage("Please enter a job description");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        router.replace("/login");
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          jobDescription,
          useDocuments,
          demoData: formData ? {
            profile: formData.profile,
            work_experiences: formData.work_experiences,
            educations: formData.educations,
            skills: formData.skills,
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to generate resume");
      }

      setGeneratedResume(data.tailoredResume);
    } catch (error) {
      console.error("Error generating resume:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate resume. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-[#F7F2EA] text-[#1B1712] flex items-center justify-center">
        <div className="rounded-2xl border border-[#E4D7CA] bg-[#FFFCF7] px-6 py-4 text-sm text-[#6F6257]">
          Loading your workspace...
        </div>
      </div>
    );
  }

  const cardClass =
    "rounded-3xl border border-[#E4D7CA] bg-[#FFFCF7] p-6 shadow-[0_18px_40px_rgba(20,16,12,0.08)]";

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
                <div className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Dashboard</div>
              </div>
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {userEmail && <span className="hidden text-[#6F6257] md:inline">{userEmail}</span>}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-[#1B1712] bg-[#1B1712] px-4 py-2 text-xs font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C]"
              >
                Sign out
              </button>
            </div>
          </div>
        </nav>

        <main className="relative z-10 px-6 py-10">
          <div className="container mx-auto max-w-6xl">
            <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Your tailoring studio</p>
                <h1 className="mt-3 font-serif text-3xl md:text-4xl">Build resumes with confidence.</h1>
                <p className="mt-3 text-sm text-[#6F6257]">
                  Save your story once, then tailor it for every new opportunity.
                </p>
              </div>
              <div className="rounded-full border border-[#E4D7CA] bg-[#FFFCF7] px-4 py-2 text-xs font-semibold text-[#6F6257]">
                Plan: Free tier
              </div>
            </header>

            {errorMessage && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <section className="lg:col-span-7 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Profile</p>
                      <h2 className="font-serif text-2xl">Profile, work history, skills</h2>
                    </div>
                    <span className="text-xs text-[#6F6257]">Save after updates</span>
                  </div>
                  <IngestionForm
                    onContextTypeChange={setUseDocuments}
                    useDocuments={useDocuments}
                    onFormDataChange={handleFormDataChange}
                  />
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Projects</p>
                      <h3 className="mt-2 font-serif text-xl">Highlight your strongest work</h3>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#8B5B2B]" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-[#6F6257]">
                    <input
                      type="text"
                      placeholder="Project name"
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                    <textarea
                      rows={3}
                      placeholder="Impact, metrics, tools used"
                      className="w-full resize-none rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                    <input
                      type="url"
                      placeholder="Project link (optional)"
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                    <button className="rounded-full border border-[#1B1712] px-4 py-2 text-xs font-semibold text-[#1B1712] transition hover:-translate-y-0.5">
                      Add another project
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Websites</p>
                  <h3 className="mt-2 font-serif text-xl">Share your public profiles</h3>
                  <div className="mt-4 grid gap-3 text-sm text-[#6F6257]">
                    <input
                      type="url"
                      placeholder="LinkedIn"
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                    <input
                      type="url"
                      placeholder="GitHub or portfolio"
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                    <input
                      type="url"
                      placeholder="Personal website"
                      className="w-full rounded-2xl border border-[#D9CBBE] bg-[#F7F2EA] px-4 py-2 text-sm text-[#1B1712] focus:border-[#8B5B2B] focus:outline-none focus:ring-2 focus:ring-[#8B5B2B]/20"
                    />
                  </div>
                </div>
              </section>

              <section className="lg:col-span-5 space-y-6">
                <JobTargetInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />

                {generatedResume && <ResumeViewer resume={generatedResume} />}

                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">History</p>
                      <h3 className="mt-2 font-serif text-xl">Recent resumes</h3>
                    </div>
                    <History className="h-4 w-4 text-[#8B5B2B]" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-[#6F6257]">
                    <div className="rounded-2xl border border-[#E4D7CA] bg-[#F7F2EA] p-4">
                      No resumes yet. Generate your first draft to see it here.
                    </div>
                    <button className="rounded-full border border-[#1B1712] px-4 py-2 text-xs font-semibold text-[#1B1712] transition hover:-translate-y-0.5">
                      View full history
                    </button>
                  </div>
                </div>

                <div className={cardClass}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Payment</p>
                      <h3 className="mt-2 font-serif text-xl">Usage and plans</h3>
                    </div>
                    <CreditCard className="h-4 w-4 text-[#8B5B2B]" />
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-[#6F6257]">
                    <div className="rounded-2xl border border-[#E4D7CA] bg-[#F7F2EA] p-4">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#6F6257]">
                        Free credits
                        <span className="text-[#1B1712]">3 left</span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E4D7CA]">
                        <div className="h-full w-[40%] rounded-full bg-[#8B5B2B]" />
                      </div>
                    </div>
                    <button className="rounded-full bg-[#1B1712] px-4 py-2 text-xs font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C]">
                      Explore plans
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E7B4A4] bg-[#FFF5F2] p-6 shadow-[0_12px_30px_rgba(20,16,12,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#A0513F]">Delete account</p>
                      <h3 className="mt-2 font-serif text-xl text-[#A0513F]">Permanently remove data</h3>
                    </div>
                    <Trash2 className="h-4 w-4 text-[#A0513F]" />
                  </div>
                  <p className="mt-3 text-sm text-[#A0513F]">
                    You can request a full delete. You will have 15 days to undo the request.
                  </p>
                  <button className="mt-4 rounded-full border border-[#A0513F] px-4 py-2 text-xs font-semibold text-[#A0513F] transition hover:-translate-y-0.5">
                    Request account deletion
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
