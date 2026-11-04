"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, Loader2, LogIn } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your admin email and password.");
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
      if (result.error) {
        const failure = result.error as {
          message?: string;
          error?: string;
          status?: number;
          statusText?: string;
        };
        console.error("[admin] sign-in error:", failure);
        const detail =
          failure.message ||
          (typeof failure.error === "string" ? failure.error : "") ||
          `Sign-in failed (HTTP ${failure.status ?? "?"}). Open /api/admin/session?check=db for diagnostics.`;
        setError(detail);
        setBusy(false);
        return;
      }
      // Full navigation remounts the root ContentProvider with the new session cookie.
      window.location.replace(params.get("next") || "/admin");
    } catch (caught) {
      // A TypeError here means the browser never reached /api/auth (network,
      // CORS or mixed-content failure), not wrong credentials.
      console.error("[admin] sign-in request failed:", caught);
      setError(
        caught instanceof TypeError
          ? "Could not reach the sign-in endpoint. Open DevTools → Network to see the failed request URL, then verify BETTER_AUTH_URL and redeploy."
          : caught instanceof Error
            ? caught.message
            : "Sign-in failed. Please try again.",
      );
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="premium-card rounded-[3px] p-7 sm:p-9">
        <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-[2px] border border-[#d8c9a9] bg-[rgba(177,138,80,0.1)] text-[#a17b42]">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="eyebrow">Content Studio</p>
        <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-[-0.045em] text-[#171717]">
          Admin sign in
        </h1>
        <p className="mt-3 font-body text-sm leading-7 text-[#77756f]">
          Only the portfolio owner can edit content. Public sign-up is disabled.
        </p>

        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <label className="block">
            <span className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">Admin email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@your-domain.com"
              className="mt-2 w-full rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-4 py-3 font-body text-sm text-[#171717] outline-none placeholder:text-[#b0aa9c] focus:border-[#b18a50] focus:ring-2 focus:ring-[rgba(177,138,80,0.18)]"
            />
          </label>
          <label className="block">
            <span className="font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#171717]">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your admin password"
              className="mt-2 w-full rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] px-4 py-3 font-body text-sm text-[#171717] outline-none placeholder:text-[#b0aa9c] focus:border-[#b18a50] focus:ring-2 focus:ring-[rgba(177,138,80,0.18)]"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-[2px] border border-[#d8a9a3] bg-[rgba(163,58,47,0.07)] p-3 font-body text-xs leading-6 text-[#a33a2f]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[2px] border border-[#171717] bg-[#171717] font-accent text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#ffffff] transition-colors hover:border-[#a17b42] hover:bg-[#a17b42] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center font-body text-[0.7rem] leading-5 text-[#9b968b]">
          Credentials come from <span className="font-mono">ADMIN_EMAIL</span> / <span className="font-mono">ADMIN_PASSWORD</span>.
        </p>
      </div>

      <Link href="/" className="editorial-link mt-7 justify-center">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to website
      </Link>
    </div>
  );
}