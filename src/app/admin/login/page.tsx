"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth/login";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to sign in right now.");
      }

      const token = payload?.token;
      const userData = payload?.data;

      if (!token) {
        throw new Error("Login succeeded, but no token was returned.");
      }

      // Save token securely
      localStorage.setItem("hotel_admin_token", token);

      // Save user role and data to manage access (SuperAdmin vs Admin)
      if (userData) {
        localStorage.setItem("hotel_admin_user", JSON.stringify(userData));
      }

      router.replace("/admin/dashboard");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to sign in right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-6rem)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(201,163,107,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,_#050607,_#07090c_42%,_#030405)] px-6 py-10 text-white sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/3 h-80 w-80 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-96 w-96 rounded-full bg-amber-300/8 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <section className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/8 px-4 py-2 text-xs uppercase tracking-[0.34em] text-amber-100/90 backdrop-blur-md">
            <ShieldCheck size={14} />
            Secure Admin Access
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Welcome to the private luxury command suite.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/72 sm:text-lg lg:text-xl">
            Sign in to manage reservations, curated content, room inventory, and
            guest experiences from a refined admin workspace designed for a
            five-star brand.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ["JWT secured", "Token-based authentication for admin sessions."],
              [
                "Fast access",
                "Immediate redirect to the dashboard after login.",
              ],
              [
                "Luxury UI",
                "Dark glass surfaces, gold accents, and cinematic depth.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
              >
                <div className="text-sm font-semibold tracking-wide text-amber-200">
                  {title}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-amber-400/10 via-white/5 to-transparent blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <div className="border-b border-white/10 px-6 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.34em] text-amber-200/90">
                    <Sparkles size={14} />
                    The LUX Hotel
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-white">
                    Admin Login
                  </h2>
                </div>

                <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-amber-100/90">
                  Private Entry
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-6 py-8 sm:px-8"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@theluxhotel.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-amber-300/45 focus:bg-black/50"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-xs uppercase tracking-[0.28em] text-white/55"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your secure password"
                    className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 pr-12 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-amber-300/45 focus:bg-black/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-white/45 transition-colors hover:text-amber-200"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Forgot Password Link moved below the input */}
                <div className="mt-3 flex justify-end">
                  <Link
                    href="/admin/forgot-password"
                    className="text-xs tracking-wide text-amber-200/60 transition-colors hover:text-amber-300"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="lux-action inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 px-5 py-3.5 text-sm font-semibold tracking-wide text-black shadow-[0_18px_50px_rgba(201,163,107,0.35)] transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Authenticating..." : "Enter Dashboard"}
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs uppercase tracking-[0.22em] text-white/45">
                <Link
                  href="/"
                  className="transition-colors hover:text-amber-200"
                >
                  Return to website
                </Link>
                <span>Protected access only</span>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
