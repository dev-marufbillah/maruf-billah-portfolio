"use client";

import { ArrowUpRight, Mail, MessageCircle, Phone, ShieldCheck, type LucideIcon } from "lucide-react";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { ContactForm } from "@/components/contact/ContactForm";
import { useContent } from "@/components/providers/ContentProvider";
import { cn, getContactHref, isSafeHttpUrl } from "@/lib/utils";
import type { ContactDetail } from "@/types";

const contactIcons: Record<ContactDetail["kind"], LucideIcon> = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
};

function ContactRow({ detail }: { detail: ContactDetail }) {
  const Icon = contactIcons[detail.kind];
  const href = detail.value ? getContactHref(detail.kind, detail.value) : null;
  const active = Boolean(
    href && href !== "#" && (href.startsWith("mailto:") || href.startsWith("tel:") || isSafeHttpUrl(href)),
  );

  const inner = (
    <>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border border-[#d8d2c4] bg-[#fffefb] text-[#a17b42]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="eyebrow eyebrow--dark block">{detail.label}</span>
        <span className={cn("mt-1 block truncate font-body text-sm font-medium", active ? "text-[#171717]" : "text-[#a9a295]")}>
          {active ? detail.value : detail.placeholder}
        </span>
        {!active && <span className="mt-1 hidden truncate font-mono text-[0.58rem] text-[#b0aa9c] sm:block">{detail.editPath}</span>}
      </span>
      {active ? (
        <ArrowUpRight className="h-4 w-4 shrink-0 text-[#8b8579] transition-colors group-hover:text-[#a17b42]" aria-hidden="true" />
      ) : (
        <span className="rounded-full border border-[#d8c9a9] px-2 py-1 font-accent text-[0.54rem] font-semibold uppercase tracking-[0.12em] text-[#8a6a3b]">Add</span>
      )}
    </>
  );

  return active && href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex min-w-0 items-center gap-4 rounded-[2px] border border-[#e5e2da] bg-[#fffefb] p-3.5 transition-colors sm:p-4 hover:border-[#b18a50] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b18a50]"
    >
      {inner}
    </a>
  ) : (
    <div aria-disabled="true" className="group flex min-w-0 items-center gap-4 rounded-[2px] border border-dashed border-[#d8d2c4] bg-transparent p-4">
      {inner}
    </div>
  );
}

export function Contact() {
  const { content } = useContent();
  const { personal, contactSocialIds, homepage } = content;

  return (
    <section id="contact" className="section--pure relative border-t border-[#e5e2da] py-16 sm:py-32">
      <div className="editorial-shell">
        <SectionHeading kicker={homepage.contact.kicker} title={homepage.contact.heading} description={homepage.contact.lead} />

        <div className="mt-11 grid min-w-0 items-start gap-7 sm:mt-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14 xl:gap-20">
          <ScrollReveal variant="up" className="min-w-0 space-y-4">
            <div className="premium-card min-w-0 rounded-[3px] p-5 sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Contact details</p>
                  <h3 className="mt-2 font-display text-2xl font-medium text-[#171717]">Reach out directly</h3>
                </div>
                <ShieldCheck className="h-5 w-5 text-[#a17b42]" aria-hidden="true" />
              </div>
              <div className="space-y-3">
                {personal.contact.map((detail) => (
                  <ContactRow key={detail.id} detail={detail} />
                ))}
              </div>
            </div>

            <div className="premium-card min-w-0 rounded-[3px] p-5 sm:p-7">
              <p className="eyebrow">Profiles</p>
              <h3 className="mt-2 font-display text-xl font-medium text-[#171717]">GitHub, LinkedIn &amp; Facebook</h3>
              <SocialLinks ids={contactSocialIds} showLabels className="mt-6" />
              <p className="mt-5 font-body text-xs leading-6 text-[#8b8579]">
                Disabled icons are placeholders. Add real URLs in Content Studio → Links &amp; Contact.
              </p>
            </div>

            <div className="rounded-[3px] border border-[#e2d5b8] bg-[rgba(177,138,80,0.06)] p-5">
              <p className="eyebrow">Availability</p>
              <p className="mt-2 font-body text-sm leading-7 text-[#7a5f34]">
                Add your real availability, timezone, or preferred project types in Content Studio before publishing.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="right" className="min-w-0" delay={0.1}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
