import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  description: "Private Content Studio sign in for the portfolio owner.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f7f6f2] px-5 py-16">
      <Suspense fallback={<div className="font-body text-sm text-[#77756f]">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
