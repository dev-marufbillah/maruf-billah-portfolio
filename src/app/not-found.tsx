import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="editorial-shell flex min-h-[75vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow">404 / Page not found</p>
      <h1 className="mt-5 font-display text-[clamp(4rem,12vw,10rem)] font-medium leading-none tracking-[-0.08em] text-[#171717]">
        4<span className="font-luxury italic text-[#a17b42]">0</span>4
      </h1>
      <p className="mt-6 max-w-lg font-body text-sm leading-7 text-[#77756f] sm:text-base">
        The page you requested does not exist. Return to the homepage or browse the featured project concepts.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/" icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>Back to home</Button>
        <Button href="/#projects" variant="outline">View projects</Button>
      </div>
      <Link href="/#contact" className="editorial-link mt-8">
        Report a broken link
      </Link>
    </section>
  );
}
