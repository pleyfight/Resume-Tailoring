import Link from "next/link";
import { Sparkles, Target, FileText, CheckCircle, Shield, Clock, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen text-[#1B1712]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C29B6F]/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-24 h-[420px] w-[420px] rounded-full bg-[#6E7B6C]/15 blur-3xl" />

        <nav className="relative z-10 border-b border-[#E4D7CA] bg-[#FFFCF7]/80 backdrop-blur">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D8CBBE] bg-[#FFF9F1]">
                <Sparkles className="h-5 w-5 text-[#8B5B2B]" />
              </div>
              <div>
                <div className="font-serif text-xl font-semibold tracking-tight">Sleek</div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Resume Studio</div>
              </div>
            </div>
            <div className="hidden items-center gap-6 text-sm text-[#6F6257] md:flex">
              <a href="#features" className="hover:text-[#1B1712]">Features</a>
              <a href="#workflow" className="hover:text-[#1B1712]">Workflow</a>
              <a href="#care" className="hover:text-[#1B1712]">Our care</a>
              <Link href="/login" className="hover:text-[#1B1712]">Login</Link>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full border border-[#1B1712] bg-[#1B1712] px-5 py-2 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C]"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <section className="relative z-10 px-6 pb-16 pt-16 md:pb-24 md:pt-20">
          <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E4D7CA] bg-[#FFFCF7] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6F6257]">
                Premium, empathetic resume tailoring
              </div>
              <h1 className="mt-6 font-serif text-4xl leading-tight md:text-6xl">
                Tailor every resume with the care a new chapter deserves.
              </h1>
              <p className="mt-6 text-lg text-[#6F6257]">
                Sleek helps new grads and experienced professionals craft a tailored resume for every job description.
                Bring your story, we shape it with clarity, confidence, and ATS-ready structure.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1B1712] px-6 py-3 text-sm font-semibold text-[#FFFCF7] transition hover:-translate-y-0.5 hover:bg-[#2C241C]"
                >
                  Start tailoring
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#workflow"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#CBB9A9] bg-[#FFFCF7] px-6 py-3 text-sm font-semibold text-[#1B1712] transition hover:-translate-y-0.5"
                >
                  See the process
                </Link>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {[
                  { label: "Minutes to a tailored draft", value: "< 3" },
                  { label: "Resume versions saved", value: "20+" },
                  { label: "Data privacy by design", value: "Private" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#E4D7CA] bg-[#FFFCF7] p-4 shadow-[0_10px_24px_rgba(20,16,12,0.08)]"
                    style={{ animation: "fade-up 0.8s ease-out", animationFillMode: "both" }}
                  >
                    <div className="text-2xl font-semibold">{item.value}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-[#6F6257]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-[#E4D7CA] bg-[#FFFCF7] p-6 shadow-[0_24px_60px_rgba(20,16,12,0.12)]">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#6F6257]">
                  Resume snapshot
                  <span className="rounded-full border border-[#E4D7CA] px-3 py-1">Draft</span>
                </div>
                <div className="mt-6 space-y-5">
                  <div>
                    <div className="text-lg font-semibold">Jordan Lee</div>
                    <div className="text-sm text-[#6F6257]">Product Analyst | Seattle, WA</div>
                  </div>
                  <div className="rounded-2xl border border-[#E4D7CA] bg-[#F7F2EA] p-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Summary</div>
                    <p className="mt-3 text-sm text-[#1B1712]">
                      Analytical operator with 4+ years translating customer data into revenue growth.
                      Seeking a role focused on experimentation, lifecycle metrics, and cross-team delivery.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Target className="h-4 w-4 text-[#8B5B2B]" />
                      JD-aligned highlights
                    </div>
                    <div className="rounded-2xl border border-[#E4D7CA] bg-[#FFFCF7] p-4 text-sm text-[#6F6257]">
                      <ul className="space-y-2">
                        <li>Reduced onboarding time by 32% with a new lifecycle experiment.</li>
                        <li>Built SQL dashboards to surface retention drop-offs across cohorts.</li>
                        <li>Partnered with design to ship a new activation flow.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#E4D7CA] bg-[#F7F2EA] p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Match score</span>
                      <span className="text-sm font-semibold text-[#1B1712]">86%</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E4D7CA]">
                      <div className="h-full w-[86%] rounded-full bg-[#8B5B2B]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-[#E4D7CA] bg-[#FFFCF7] p-5 text-sm text-[#6F6257]">
                Your resume stays private, stored in your own secure workspace.
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="px-6 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[#6F6257]">Tailoring features</p>
            <h2 className="font-serif text-3xl md:text-4xl">
              A calm, guided workflow built for real job searches.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Human-sounding summaries",
                description: "Turn your experience into a concise narrative that aligns to the role without losing your voice.",
                icon: <Sparkles className="h-5 w-5 text-[#8B5B2B]" />,
              },
              {
                title: "ATS-aligned structure",
                description: "Organize your work history, skills, and results in a format that scanners and hiring managers love.",
                icon: <FileText className="h-5 w-5 text-[#8B5B2B]" />,
              },
              {
                title: "Private by default",
                description: "Your documents stay in your own space with secure storage and clear delete controls.",
                icon: <Shield className="h-5 w-5 text-[#8B5B2B]" />,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[#E4D7CA] bg-[#FFFCF7] p-6 shadow-[0_18px_40px_rgba(20,16,12,0.08)]"
                style={{ animation: "fade-up 0.9s ease-out", animationFillMode: "both" }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E4D7CA] bg-[#F7F2EA]">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-[#6F6257]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-[32px] border border-[#E4D7CA] bg-[#FFFCF7] px-6 py-12 shadow-[0_18px_50px_rgba(20,16,12,0.08)] md:px-12">
            <div className="grid gap-10 md:grid-cols-3">
              {[
                {
                  title: "Build your profile",
                  description: "Upload a resume or add experience manually. We organize the details for you.",
                },
                {
                  title: "Paste the job description",
                  description: "We extract the core skills and priorities from each posting.",
                },
                {
                  title: "Generate and refine",
                  description: "Get a tailored resume draft and adjust as you go.",
                },
              ].map((step, index) => (
                <div key={step.title} className="space-y-4">
                  <div className="text-sm font-semibold text-[#8B5B2B]">
                    Step {index + 1}
                  </div>
                  <div className="text-lg font-semibold">{step.title}</div>
                  <p className="text-sm text-[#6F6257]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="care" className="px-6 pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#E4D7CA] bg-[#F7F2EA] p-8">
              <h3 className="font-serif text-2xl">Support for every chapter</h3>
              <p className="mt-4 text-sm text-[#6F6257]">
                Whether you are just getting started, switching industries, or returning after a layoff,
                Sleek guides you with a calm, premium workflow that respects your time.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-[#1B1712]">
                <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />
                Empathetic prompts that highlight your wins.
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-[#1B1712]">
                <Clock className="h-4 w-4 text-[#8B5B2B]" />
                Save time with guided, repeatable workflows.
              </div>
            </div>
            <div className="rounded-3xl border border-[#E4D7CA] bg-[#FFFCF7] p-8">
              <h3 className="font-serif text-2xl">Thoughtful limits, flexible pricing</h3>
              <p className="mt-4 text-sm text-[#6F6257]">
                Start with a generous free tier. When you need more, choose a monthly plan or pay as you go.
              </p>
              <div className="mt-6 space-y-3 text-sm text-[#1B1712]">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />
                  Free resume drafts each month
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />
                  Upgrade only when you need more output
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-[#8B5B2B]" />
                  Always know what you have left
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="container mx-auto max-w-6xl">
          <div className="rounded-[36px] border border-[#1B1712] bg-[#1B1712] px-8 py-12 text-[#FFFCF7] md:px-16">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl">Ready to tailor your next resume?</h2>
                <p className="mt-3 text-sm text-[#EADFD3]">
                  A polished resume for every job description, built with care and clarity.
                </p>
              </div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#FFFCF7] px-6 py-3 text-sm font-semibold text-[#1B1712] transition hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E4D7CA] bg-[#FFFCF7] px-6 py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-sm text-[#6F6257] md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#8B5B2B]" />
            <span className="font-serif text-base text-[#1B1712]">Sleek</span>
          </div>
          <div>Tailored resumes with premium care.</div>
          <div>2026 Sleek. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
