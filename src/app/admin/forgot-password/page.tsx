"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, KeyRound, Mail, ShieldCheck } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // step 1 = Email එක ගහලා OTP එක ඉල්ලන තැන
  // step 2 = OTP එකයි අලුත් Password එකයි දෙන තැන
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Step 1: OTP එක Email එකට යවන Function එක
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to send OTP.");

      setMessage(data.message || "OTP sent successfully! Check your email.");
      setTimeout(() => setMessage(""), 3000);
      setStep(2); // ඊළඟ අදියරට (Step 2) යනවා
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: අලුත් Password එක Save කරන Function එක
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to reset password.");

      setMessage("Password reset successfully! Redirecting to login...");

      // තත්පර 2කින් ඉබේම Login පිටුවට යනවා
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(201,163,107,0.15),transparent_25%),linear-gradient(180deg,_#050607,_#07090c_42%,_#030405)] p-5 text-white selection:bg-amber-300/30">
      <div className="w-full max-w-[26rem]">
        {/* Brand Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 font-semibold text-black shadow-[0_18px_45px_rgba(201,163,107,0.3)]">
            L
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-white">
            Account Recovery
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Secure access to the command center
          </p>
        </div>

        {/* Main Card */}
        <div className="relative rounded-[2rem] border border-white/10 bg-black/40 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl before:absolute before:inset-0 before:-z-10 before:rounded-[2rem] before:bg-gradient-to-b before:from-white/5 before:to-transparent">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-[13px] leading-relaxed text-rose-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[13px] leading-relaxed text-emerald-200">
              {message}
            </div>
          )}

          {step === 1 ? (
            // --- Step 1: Request OTP ---
            <form
              onSubmit={handleRequestOTP}
              className="space-y-5"
              autoComplete="off"
            >
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                  <Mail size={14} /> Registered Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-amber-300/45 focus:bg-black/50"
                  placeholder="admin@theluxhotel.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="lux-action mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(201,163,107,0.25)] transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-70"
              >
                {isLoading ? "Sending OTP..." : "Send Verification Code"}
                {!isLoading && <ArrowRight size={16} />}
              </button>
            </form>
          ) : (
            // --- Step 2: Reset Password ---
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
              autoComplete="off"
            >
              <div>
                <label className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                  <ShieldCheck size={14} /> Security Code (OTP)
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-center text-xl tracking-[0.5em] text-amber-200 outline-none transition-colors placeholder:text-white/20 focus:border-amber-300/45 focus:bg-black/50"
                  placeholder="------"
                  maxLength={6}
                />
                <p className="mt-2 text-center text-[10px] text-amber-200/50">
                  Please check your email for the 6-digit code. Valid for 3
                  minutes.
                </p>
              </div>

              <div>
                <label className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
                  <KeyRound size={14} /> New Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-white/20 focus:border-amber-300/45 focus:bg-black/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="lux-action mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 py-3.5 text-sm font-semibold text-black shadow-[0_18px_50px_rgba(201,163,107,0.25)] transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-70"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <Link
            href="/admin/login"
            className="text-xs font-medium uppercase tracking-[0.15em] text-white/45 transition-colors hover:text-amber-200"
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
