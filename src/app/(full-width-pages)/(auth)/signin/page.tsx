"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";

const features = [
  { title: "Track Everything", desc: "Accounts, transactions, bills, and budgets in one place" },
  { title: "Smart Insights", desc: "Beautiful charts and analytics to understand your money" },
  { title: "Secure & Private", desc: "Your financial data is encrypted and protected" },
];

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = useRef(createClient());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.current.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); setLoading(false); return; }
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/logo/logo-icon.svg')] opacity-5 bg-repeat space-y-4 bg-[length:200px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col justify-center px-16 max-w-lg">
          <Link href="/" className="mb-12">
            <h1 className="text-3xl font-bold text-white tracking-tight">Kwarta</h1>
            <p className="text-brand-200 text-sm mt-1">Personal Finance Dashboard</p>
          </Link>
          <div className="space-y-8">
            {features.map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{f.title}</h3>
                  <p className="text-brand-200 text-sm mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md py-12">
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kwarta</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Personal Finance Dashboard</p>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
              <input
                type="email" autoComplete="email" autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3.5 pr-12 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]"
            >
              {loading && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
