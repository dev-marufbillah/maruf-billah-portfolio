"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  ExternalLink,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Save,
  Settings2,
  Upload,
} from "lucide-react";
import { useContent, readLegacyLocalContent } from "@/components/providers/ContentProvider";
import { FileField, JsonField, ObjectArrayEditor, ObjectEditor, type FieldDef } from "@/components/admin/fields";
import { authClient, useSession } from "@/lib/auth-client";
import { defaultContent } from "@/lib/default-content";
import { deepMerge } from "@/lib/deep-merge";
import { SECTION_KEYS } from "@/lib/section-keys";
import { cn } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

type Obj = Record<string, unknown>;
type TabId =
  | "overview"
  | "profile"
  | "homepage"
  | "links"
  | "resume"
  | "skills"
  | "education"
  | "experience"
  | "achievements"
  | "services"
  | "projects"
  | "appearance"
  | "seo"
  | "advanced";

const tabs: Array<{ id: TabId; label: string; group: string }> = [
  { id: "overview", label: "Overview", group: "Start" },
  { id: "profile", label: "Profile & About", group: "Content" },
  { id: "homepage", label: "Homepage & Intro", group: "Content" },
  { id: "links", label: "Links & Contact", group: "Content" },
  { id: "resume", label: "Resume", group: "Content" },
  { id: "skills", label: "Skills", group: "Content" },
  { id: "education", label: "Education", group: "Content" },
  { id: "experience", label: "Experience", group: "Content" },
  { id: "achievements", label: "Achievements", group: "Content" },
  { id: "services", label: "Services", group: "Content" },
  { id: "projects", label: "Projects", group: "Content" },
  { id: "appearance", label: "Fonts, Logo & Theme", group: "Design" },
  { id: "seo", label: "SEO", group: "Design" },
  { id: "advanced", label: "Advanced JSON", group: "Design" },
];

const socialIdOptions = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X / Twitter" },
];

const statusOptions = [
  { value: "Planning", label: "Planning" },
  { value: "In Development", label: "In Development" },
  { value: "Completed", label: "Completed" },
  { value: "Live", label: "Live" },
];

const fontOptions = [
  { value: "editorial", label: "Editorial serif — Playfair + Instrument + Inter (default)" },
  { value: "modern", label: "Modern luxury — Sora + Inter" },
  { value: "current", label: "Current — Space Grotesk + Inter" },
];

const logoOptions = [
  { value: "monogram", label: "Monogram + text" },
  { value: "serif", label: "Luxury serif" },
  { value: "minimal", label: "Minimal text" },
];

const animationOptions = [
  { value: "full", label: "Full — varied reveals" },
  { value: "subtle", label: "Subtle — shorter movement" },
  { value: "off", label: "Off — no scroll animation" },
];

const tabSections: Record<string, string[]> = {
  overview: [],
  profile: ["personal"],
  homepage: ["homepage"],
  links: ["socialLinks", "navigation", "heroSocialIds", "contactSocialIds", "personal"],
  resume: ["personal"],
  skills: ["skillCategories"],
  education: ["educationEntries", "educationPlaceholder", "educationSection"],
  experience: ["experienceEntries", "developmentJourney"],
  achievements: ["achievements", "achievementsSection"],
  services: ["services", "servicesSection"],
  projects: ["projects", "projectsSection"],
  appearance: ["appearance"],
  seo: ["seo"],
  advanced: [...SECTION_KEYS],
};

function SaveBar({ sectionKeys }: { sectionKeys: string[] }) {
  const { dirtyKeys, saveState, saveSections } = useContent();
  const [busy, setBusy] = useState(false);
  const dirty = sectionKeys.some((key) => dirtyKeys.includes(key));
  const relevant = saveState.status !== "idle" && dirtyKeys.length === 0;

  if (sectionKeys.length === 0) return null;

  const onSave = async () => {
    setBusy(true);
    await saveSections(sectionKeys);
    setBusy(false);
  };

  return (
    <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-[3px] border border-[#e5e2da] bg-[#fffefb]/95 p-3 shadow-[0_18px_50px_-30px_rgba(23,23,23,0.45)] backdrop-blur">
      <div className="min-w-0">
        <p className="font-accent text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#8b8579]">
          {dirty ? "Unsaved changes" : "All changes saved"}
        </p>
        {saveState.message && (
          <p role={saveState.status === "error" ? "alert" : "status"} className={cn("mt-1 font-body text-xs leading-5", saveState.status === "error" ? "text-[#a33a2f]" : saveState.status === "success" ? "text-[#4f6b52]" : "text-[#77756f]")}>
            {saveState.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {relevant && saveState.status === "success" && <CheckCircle2 className="h-4 w-4 text-[#4f6b52]" aria-hidden="true" />}
        {relevant && saveState.status === "error" && <AlertCircle className="h-4 w-4 text-[#a33a2f]" aria-hidden="true" />}
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={busy || saveState.status === "loading"}
          className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#171717] bg-[#171717] px-4 font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#ffffff] transition-colors hover:border-[#a17b42] hover:bg-[#a17b42] disabled:opacity-55"
        >
          {busy || saveState.status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
          {busy || saveState.status === "loading" ? "Saving…" : "Save this section"}
        </button>
      </div>
    </div>
  );
}

function Panel({ title, description, sectionKeys = [], children }: { title: string; description?: string; sectionKeys?: string[]; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-medium tracking-[-0.035em] text-[#171717] sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>}
      </div>
      {children}
      <SaveBar sectionKeys={sectionKeys} />
    </div>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("premium-card rounded-2xl p-5 sm:p-6", className)}>{children}</div>;
}

export function AdminStudio() {
  const {
    content,
    setContent,
    loaded,
    sessionInfo,
    refreshSession,
    resetContent,
    importContent,
    exportContent,
    source,
    hasData,
    dirtyKeys,
    refetch,
  } = useContent();
  const router = useRouter();
  const { data: liveSession } = useSession();
  const authenticated = sessionInfo.authenticated || Boolean(liveSession?.user);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [importError, setImportError] = useState("");
  const [migrating, setMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const update = (mutator: (draft: PortfolioContent) => void) => {
    setContent((previous) => {
      const draft = JSON.parse(JSON.stringify(previous)) as PortfolioContent;
      mutator(draft);
      return draft;
    });
  };

  const asObjects = (value: unknown) => value as unknown as Obj[];
  const fullObject = content as unknown as Obj;
  const updateFullObject = (updated: Obj) => setContent(updated as unknown as PortfolioContent);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      await refreshSession();
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const downloadJson = () => {
    const blob = new Blob([exportContent()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "maruf-portfolio-content.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importContent(String(reader.result));
        setImportError("");
      } catch {
        setImportError("The selected file is not valid JSON.");
      }
    };
    reader.readAsText(file);
  };

  /** One-click migration of old hardcoded / localStorage / JSON data into MongoDB. */
  const migrateLegacy = useCallback(async () => {
    setMigrating(true);
    setMigrationMessage("");
    try {
      const legacy = readLegacyLocalContent();
      const merged = deepMerge(defaultContent, legacy ?? undefined) as PortfolioContent;
      const sections: Record<string, unknown> = {};
      for (const key of SECTION_KEYS) sections[key] = merged[key as keyof PortfolioContent];
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || `Migration failed (${response.status}).`);
      await refetch();
      setMigrationMessage("Existing browser/JSON data migrated into the database. All devices now read the same data.");
    } catch (error) {
      setMigrationMessage(error instanceof Error ? error.message : "Migration failed.");
    } finally {
      setMigrating(false);
    }
  }, [refetch]);

  if (!loaded) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f7f6f2] px-6">
        <div className="text-center"><Settings2 className="mx-auto h-8 w-8 animate-pulse text-[#a17b42]" /><p className="mt-4 font-body text-sm text-[#77756f]">Loading Content Studio…</p></div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f7f6f2] px-5 py-16">
        <Card className="w-full max-w-md">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[2px] border border-[#d8c9a9] bg-[rgba(177,138,80,0.1)] text-[#a17b42]"><LockKeyhole className="h-5 w-5" /></div>
          <h1 className="font-display text-2xl font-medium text-[#171717]">Sign in required</h1>
          <p className="mt-2 font-body text-sm leading-6 text-[#77756f]">{sessionInfo.message}</p>
          <Link href="/login" className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-[2px] border border-[#171717] bg-[#171717] font-accent text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#ffffff] hover:bg-[#a17b42]">
            Go to admin sign in
          </Link>
          <p className="mt-5 text-center font-body text-xs text-[#9b968b]"><Link href="/" className="hover:text-[#171717]">← Back to website</Link></p>
        </Card>
      </main>
    );
  }

  const profileFields: FieldDef[] = [
    { key: "personal.name", label: "Full name", type: "text" },
    { key: "personal.designation", label: "Designation", type: "text" },
    { key: "personal.location", label: "Location", type: "text" },
    { key: "personal.shortTagline", label: "Short tagline", type: "text" },
    { key: "personal.heroDescription", label: "Hero description", type: "textarea", rows: 4 },
    { key: "personal.roles", label: "Rotating roles", type: "list", hint: "One role per line." },
    { key: "personal.profileImage", label: "Profile image path / URL", type: "text", hint: "Or upload an image below." },
  ];

  const aboutFields: FieldDef[] = [
    { key: "heading", label: "Heading", type: "text" },
    { key: "subheading", label: "Subheading", type: "text" },
    { key: "verifiedIntro", label: "Introduction", type: "textarea", rows: 4 },
  ];

  const panels: Record<TabId, ReactNode> = {
    overview: (
      <Panel title="Content Studio" sectionKeys={tabSections.overview} description="Everything visual and textual is stored in MongoDB. Each section has its own Save button; nothing is written until you press it.">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><p className="eyebrow">Data source</p><p className="mt-3 font-display text-xl font-medium text-[#171717]">{source === "database" ? "MongoDB Atlas" : source === "error" ? "Connection error" : "Defaults (DB empty)"}</p><p className="mt-2 text-xs leading-6 text-muted">{sessionInfo.message}</p><p className="mt-3 border-t border-white/8 pt-3 text-xs font-semibold text-electric">{dirtyKeys.length ? `${dirtyKeys.length} unsaved section(s)` : "All changes saved"}</p></Card>
          <Card><p className="eyebrow">Content items</p><p className="mt-3 font-display text-3xl font-semibold text-white">{content.projects.length + content.services.length + content.skillCategories.length}</p><p className="mt-2 text-xs leading-6 text-muted">Projects, services, and skill groups read from the same API on every device.</p></Card>
          <Card><p className="eyebrow">Quick actions</p><div className="mt-3 flex flex-wrap gap-2"><Link href="/" className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5">View site</Link><button type="button" onClick={downloadJson} className="rounded-full border border-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/5">Export JSON</button></div></Card>
        </div>
        {!hasData && (
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">One-time migration</p>
                <h2 className="mt-2 font-display text-lg font-medium text-[#171717]">Move existing data into MongoDB</h2>
                <p className="mt-2 max-w-2xl font-body text-xs leading-6 text-[#77756f]">Earlier versions kept edits in localStorage and content/portfolio.json. Import that data into the database once; afterwards every device reads the same source. No data is lost.</p>
                {migrationMessage && <p role="status" className="mt-3 font-body text-xs text-[#4f6b52]">{migrationMessage}</p>}
              </div>
              <button type="button" onClick={() => void migrateLegacy()} disabled={migrating} className="inline-flex h-10 items-center gap-2 rounded-[2px] border border-[#171717] bg-[#171717] px-4 font-accent text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-[#ffffff] hover:bg-[#a17b42] disabled:opacity-55">
                {migrating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
                {migrating ? "Migrating…" : "Migrate data"}
              </button>
            </div>
          </Card>
        )}
        <Card>
          <h2 className="font-display text-lg font-semibold text-white">What you can manage</h2>
          <ul className="mt-4 grid gap-2 text-sm text-muted sm:grid-cols-2">
            {["Name, designation, bio and rotating roles", "Profile photo, About answers and verified facts", "Email, phone, WhatsApp and all social links", "Resume PDF upload + enable/disable", "Skill categories, icons and proficiency", "Education, experience and journey", "Achievements and certificates", "Services and full project dossiers", "Logo, luxury font preset, accent colors", "Animation level and code motifs",
            "Cinematic intro, hero headline and all section titles", "SEO title/description and raw JSON"].map((item) => (
              <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-electric" />{item}</li>
            ))}
          </ul>
        </Card>
      </Panel>
    ),

    profile: (
      <Panel title="Profile & About" sectionKeys={tabSections.profile} description="Edit identity, hero copy, About introduction, verified facts, and the eight About prompts.">
        <Card>
          <ObjectEditor value={fullObject} fields={profileFields} onChange={updateFullObject} />
          <div className="mt-5 border-t border-white/8 pt-5">
            <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted/80">Upload profile image</p>
            <FileField value={content.personal.profileImage} accept="image/*" uploadKey="personal.profileImage" onChange={(value) => { if (value) update((draft) => { draft.personal.profileImage = value; }); }} />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">About section copy</h2>
          <ObjectEditor value={content.personal.about as unknown as Obj} fields={aboutFields} onChange={(updated) => update((draft) => { draft.personal.about = { ...draft.personal.about, ...(updated as unknown as typeof draft.personal.about) }; })} />
        </Card>
        <ObjectArrayEditor
          title="Verified facts"
          description="Only add facts you want displayed publicly."
          value={asObjects(content.personal.about.verifiedFacts)}
          fields={[{ key: "label", label: "Label", type: "text" }, { key: "value", label: "Value", type: "text" }]}
          createItem={() => ({ label: "New fact", value: "Value" })}
          itemTitle={(item, index) => `${String(item.label ?? "Fact")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.personal.about.verifiedFacts = items as unknown as PortfolioContent["personal"]["about"]["verifiedFacts"]; })}
        />
        <ObjectArrayEditor
          title="About fields"
          description="Replace EDIT prompts with your real story and turn off the placeholder flag."
          value={asObjects(content.personal.about.fields)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "question", label: "Question / title", type: "text" },
            { key: "answer", label: "Answer", type: "textarea", rows: 3 },
            { key: "isPlaceholder", label: "Still a placeholder?", type: "toggle" },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `story-${content.personal.about.fields.length + 1}`, question: "New question", answer: "EDIT: Add your real answer.", isPlaceholder: true, editPath: "Content Studio → Profile & About" })}
          itemTitle={(item, index) => `${String(item.question ?? "Field")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.personal.about.fields = items as unknown as PortfolioContent["personal"]["about"]["fields"]; })}
        />
      </Panel>
    ),

    links: (
      <Panel title="Links & Contact" sectionKeys={tabSections.links} description="Add real URLs only. Empty URLs remain disabled placeholders, never broken links.">
        <ObjectArrayEditor
          title="Social links"
          value={asObjects(content.socialLinks)}
          fields={[
            { key: "id", label: "Platform", type: "select", options: socialIdOptions },
            { key: "label", label: "Display label", type: "text" },
            { key: "url", label: "Profile URL", type: "url", placeholder: "https://..." },
            { key: "icon", label: "Icon key", type: "text" },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: "github", label: "GitHub", url: null, icon: "github", editPath: "Content Studio → Links" })}
          itemTitle={(item, index) => `${String(item.label ?? "Social")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.socialLinks = items as unknown as PortfolioContent["socialLinks"]; })}
        />
        <ObjectArrayEditor
          title="Contact details"
          value={asObjects(content.personal.contact)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "label", label: "Label", type: "text" },
            { key: "value", label: "Value", type: "text", placeholder: "Email, phone or WhatsApp number" },
            { key: "placeholder", label: "Placeholder text", type: "text" },
            { key: "kind", label: "Type", type: "select", options: [{ value: "email", label: "Email" }, { value: "phone", label: "Phone" }, { value: "whatsapp", label: "WhatsApp" }] },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `contact-${content.personal.contact.length + 1}`, label: "New contact", value: null, placeholder: "ADD DETAIL", editPath: "Content Studio → Links", kind: "email" })}
          itemTitle={(item, index) => `${String(item.label ?? "Contact")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.personal.contact = items as unknown as PortfolioContent["personal"]["contact"]; })}
        />
        <ObjectArrayEditor
          title="Navigation"
          value={asObjects(content.navigation)}
          fields={[{ key: "id", label: "Section ID", type: "text" }, { key: "label", label: "Label", type: "text" }, { key: "href", label: "Anchor", type: "text", placeholder: "#section" }]}
          createItem={() => ({ id: `section-${content.navigation.length + 1}`, label: "New section", href: "#home" })}
          itemTitle={(item, index) => `${String(item.label ?? "Nav")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.navigation = items as unknown as PortfolioContent["navigation"]; })}
        />
      </Panel>
    ),

    resume: (
      <Panel title="Resume" sectionKeys={tabSections.resume} description="Upload a real PDF directly from the browser. Download and preview activate only after an upload or a public/resume.pdf file exists.">
        <Card>
          <h2 className="font-display text-lg font-semibold text-white">Upload PDF</h2>
          <p className="mt-2 text-xs leading-6 text-muted">Uploaded server-side to Cloudinary (signed). The URL and public_id are saved in the database, so the file survives refresh, other devices and redeploys. PDF up to 8 MB.</p>
          <div className="mt-5"><FileField value={content.personal.resume.dataUrl} accept="application/pdf" uploadKey="personal.resume" onChange={(value) => update((draft) => { draft.personal.resume.dataUrl = value; draft.personal.resume.enabled = Boolean(value); })} /></div>
        </Card>
        <Card>
          <ObjectEditor
            value={fullObject}
            fields={[
              { key: "personal.resume.fileName", label: "Download file name", type: "text" },
              { key: "personal.resume.downloadLabel", label: "Button label", type: "text" },
              { key: "personal.resume.path", label: "Optional public path", type: "text" },
              { key: "personal.resume.enabled", label: "Enable uploaded resume", type: "toggle" },
              { key: "personal.resume.missingMessage", label: "Missing-resume message", type: "textarea", rows: 3 },
            ]}
            onChange={updateFullObject}
          />
        </Card>
      </Panel>
    ),

    skills: (
      <Panel title="Skills" sectionKeys={tabSections.skills} description="Add categories, change official icon keys, and set verified proficiency values. Nested skill lists are edited as formatted JSON.">
        <ObjectArrayEditor
          title="Skill categories"
          value={asObjects(content.skillCategories)}
          fields={[
            { key: "id", label: "Category ID", type: "select", options: [{ value: "frontend", label: "Frontend" }, { value: "backend", label: "Backend" }, { value: "tools", label: "Tools" }] },
            { key: "label", label: "Display label", type: "text" },
            { key: "description", label: "Description", type: "text" },
            { key: "skills", label: "Skills JSON", type: "json", rows: 10, hint: "Each skill: name, icon, proficiency (number or null), editPath." },
          ]}
          createItem={() => ({ id: "frontend", label: "NEW CATEGORY", description: "Category description", skills: [{ name: "New skill", icon: "Code2", proficiency: null, editPath: "Content Studio → Skills" }] })}
          itemTitle={(item, index) => `${String(item.label ?? "Category")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.skillCategories = items as unknown as PortfolioContent["skillCategories"]; })}
        />
      </Panel>
    ),

    education: (
      <Panel title="Education" sectionKeys={tabSections.education} description="Add only verified qualifications. Leave the result blank if you do not want to publish it.">
        <ObjectArrayEditor
          title="Education entries"
          value={asObjects(content.educationEntries)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "institution", label: "Institution", type: "text" },
            { key: "degree", label: "Degree / qualification", type: "text" },
            { key: "department", label: "Department", type: "text" },
            { key: "startYear", label: "Start year", type: "text" },
            { key: "endYear", label: "Completion year", type: "text" },
            { key: "result", label: "Result (optional)", type: "text" },
            { key: "description", label: "Description", type: "textarea", rows: 3 },
            { key: "isPlaceholder", label: "Placeholder?", type: "toggle" },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `education-${content.educationEntries.length + 1}`, institution: "Institution name", degree: "Qualification", department: null, startYear: null, endYear: null, result: null, description: null, isPlaceholder: false, editPath: "Content Studio → Education" })}
          itemTitle={(item, index) => `${String(item.institution ?? "Education")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.educationEntries = items as unknown as PortfolioContent["educationEntries"]; })}
        />
      </Panel>
    ),

    experience: (
      <Panel title="Experience & Journey" sectionKeys={tabSections.experience} description="Add verified employment history. If empty, the homepage automatically shows the Development Journey section.">
        <ObjectArrayEditor
          title="Professional experience"
          value={asObjects(content.experienceEntries)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "jobTitle", label: "Job title", type: "text" },
            { key: "company", label: "Company", type: "text" },
            { key: "employmentType", label: "Employment type", type: "text" },
            { key: "location", label: "Location", type: "text" },
            { key: "startDate", label: "Start date", type: "text" },
            { key: "endDate", label: "End date", type: "text" },
            { key: "responsibilities", label: "Responsibilities", type: "list", rows: 4 },
            { key: "technologies", label: "Technologies", type: "list", rows: 3 },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `experience-${content.experienceEntries.length + 1}`, jobTitle: "Job title", company: "Company", employmentType: "Full-time", location: "Location", startDate: "Start", endDate: "End", responsibilities: [], technologies: [], editPath: "Content Studio → Experience" })}
          itemTitle={(item, index) => `${String(item.jobTitle ?? "Experience")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.experienceEntries = items as unknown as PortfolioContent["experienceEntries"]; })}
        />
        <ObjectArrayEditor
          title="Development journey prompts"
          value={asObjects(content.developmentJourney.prompts)}
          fields={[{ key: "id", label: "ID", type: "text" }, { key: "title", label: "Title", type: "text" }, { key: "prompt", label: "Prompt / real story", type: "textarea", rows: 3 }, { key: "isPlaceholder", label: "Placeholder?", type: "toggle" }, { key: "editPath", label: "Edit note", type: "text" }]}
          createItem={() => ({ id: `journey-${content.developmentJourney.prompts.length + 1}`, title: "New milestone", prompt: "EDIT: Add your real journey.", isPlaceholder: true, editPath: "Content Studio → Experience" })}
          itemTitle={(item, index) => `${String(item.title ?? "Journey")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.developmentJourney.prompts = items as unknown as PortfolioContent["developmentJourney"]["prompts"]; })}
        />
      </Panel>
    ),

    achievements: (
      <Panel title="Achievements" sectionKeys={tabSections.achievements} description="Add certificates, awards, competitions, or milestones with verifiable links only.">
        <ObjectArrayEditor
          title="Achievement entries"
          value={asObjects(content.achievements)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "name", label: "Certificate / achievement", type: "text" },
            { key: "issuer", label: "Issuing organization", type: "text" },
            { key: "issueDate", label: "Issue date", type: "text" },
            { key: "image", label: "Local image path", type: "text" },
            { key: "image", id: "imageUpload", label: "Upload certificate image", type: "file", accept: "image/*" },
            { key: "url", label: "Verification URL", type: "url" },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `achievement-${content.achievements.length + 1}`, name: "Achievement name", issuer: "Issuer", issueDate: "Date", image: null, url: null, editPath: "Content Studio → Achievements" })}
          itemTitle={(item, index) => `${String(item.name ?? "Achievement")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.achievements = items as unknown as PortfolioContent["achievements"]; })}
        />
      </Panel>
    ),

    services: (
      <Panel title="Services" sectionKeys={tabSections.services} description="Confirm, remove, or rewrite proposed service areas before publishing.">
        <ObjectArrayEditor
          title="Service cards"
          value={asObjects(content.services)}
          fields={[
            { key: "id", label: "ID", type: "text" },
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea", rows: 3 },
            { key: "icon", label: "Lucide icon name", type: "text", hint: "Examples: LayoutTemplate, Smartphone, Layers3, ShoppingBag, PenTool, Waypoints, Gauge." },
            { key: "isProposed", label: "Mark as proposed?", type: "toggle" },
            { key: "editPath", label: "Edit note", type: "text" },
          ]}
          createItem={() => ({ id: `service-${content.services.length + 1}`, title: "New service", description: "Describe the scope without claiming unverified experience.", icon: "Code2", isProposed: true, editPath: "Content Studio → Services" })}
          itemTitle={(item, index) => `${String(item.title ?? "Service")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.services = items as unknown as PortfolioContent["services"]; })}
        />
      </Panel>
    ),

    projects: (
      <Panel title="Projects" sectionKeys={tabSections.projects} description="Every card and dynamic detail page is generated from this list. Use Planning until a project is genuinely completed or live.">
        <ObjectArrayEditor
          title="Project dossiers"
          value={asObjects(content.projects)}
          fields={[
            { key: "slug", label: "Slug / URL", type: "text", placeholder: "my-project" },
            { key: "name", label: "Project name", type: "text" },
            { key: "category", label: "Category", type: "text" },
            { key: "status", label: "Status", type: "select", options: statusOptions },
            { key: "isConcept", label: "Concept / not completed?", type: "toggle" },
            { key: "description", label: "Short description", type: "textarea", rows: 3 },
            { key: "coverImage", label: "Cover image path / URL", type: "text" },
            { key: "coverImage", id: "coverImageUpload", label: "Upload cover image", type: "file", accept: "image/*" },
            { key: "coverAlt", label: "Cover alt text", type: "text" },
            { key: "technologies", label: "Technologies", type: "list", rows: 3 },
            { key: "liveUrl", label: "Live URL", type: "url", placeholder: "https://... (only if working)" },
            { key: "repoUrl", label: "Repository URL", type: "url", placeholder: "https://... (only if working)" },
            { key: "contentNotice", label: "Status notice", type: "textarea", rows: 3 },
            { key: "detailSections", label: "Detail sections JSON", type: "json", rows: 12, hint: "Overview, objectives, features, process, challenges, solutions, improvements." },
          ]}
          createItem={() => ({
            slug: `new-project-${content.projects.length + 1}`,
            name: "New Project",
            category: "Category",
            status: "Planning",
            isConcept: true,
            description: "Add a short, accurate concept description.",
            coverImage: "/projects/niketan-mart.webp",
            coverAlt: "Replaceable project concept preview.",
            technologies: ["Next.js"],
            liveUrl: null,
            repoUrl: null,
            contentNotice: "Planning-stage concept. Replace with verified build notes and a real screenshot.",
            detailSections: [],
          })}
          itemTitle={(item, index) => `${String(item.name ?? "Project")} ${index + 1}`}
          onChange={(items) => update((draft) => { draft.projects = items as unknown as PortfolioContent["projects"]; })}
        />
      </Panel>
    ),

    homepage: (
      <Panel title="Homepage & Intro" sectionKeys={tabSections.homepage} description="Edit the cinematic typed intro, hero headline, developer identity code files, and every section title — no code required. Wrap words in *asterisks* for italic serif emphasis.">
        <Card>
          <h2 className="font-display text-lg font-medium text-[#171717]">Cinematic intro</h2>
          <p className="mt-1.5 font-body text-xs leading-6 text-[#77756f]">Use {"{name}"} and {"{role}"} inside a line to insert your profile values automatically.</p>
          <div className="mt-5">
            <ObjectEditor
              value={fullObject}
              fields={[
                { key: "homepage.intro.commands", label: "Typed terminal lines", type: "list", rows: 9, hint: "One line per row. Blank lines are allowed." },
                { key: "homepage.intro.codeTitle", label: "Terminal file name", type: "text" },
                { key: "homepage.intro.hello", label: "Hello line", type: "text" },
                { key: "homepage.intro.welcome", label: "Welcome headline", type: "text" },
                { key: "homepage.intro.tagline", label: "Tagline", type: "text" },
                { key: "homepage.intro.skipLabel", label: "Skip button label", type: "text" },
                { key: "homepage.intro.footerLabel", label: "Terminal footer", type: "text" },
              ]}
              onChange={updateFullObject}
            />
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-medium text-[#171717]">Hero & section headlines</h2>
          <div className="mt-5">
            <ObjectEditor
              value={fullObject}
              fields={[
                { key: "homepage.hero.eyebrow", label: "Hero eyebrow", type: "text" },
                { key: "homepage.hero.headline", label: "Hero headline", type: "textarea", rows: 3, hint: "Wrap selected words in *asterisks* to render them in italic serif gold." },
                { key: "homepage.hero.portraitLabel", label: "Portrait label", type: "text" },
                { key: "homepage.hero.portraitCaption", label: "Portrait caption", type: "text" },
                { key: "homepage.hero.scrollLabel", label: "Scroll label", type: "text" },
                { key: "homepage.skills.kicker", label: "Skills kicker", type: "text" },
                { key: "homepage.skills.heading", label: "Skills heading", type: "text" },
                { key: "homepage.skills.lead", label: "Skills description", type: "textarea", rows: 3 },
                { key: "homepage.contact.kicker", label: "Contact kicker", type: "text" },
                { key: "homepage.contact.heading", label: "Contact heading", type: "text" },
                { key: "homepage.contact.lead", label: "Contact description", type: "textarea", rows: 3 },
                { key: "homepage.footer.note", label: "Footer note", type: "text" },
              ]}
              onChange={updateFullObject}
            />
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-lg font-medium text-[#171717]">Behind the Code — developer identity</h2>
          <div className="mt-5">
            <ObjectEditor
              value={fullObject}
              fields={[
                { key: "homepage.identity.kicker", label: "Kicker", type: "text" },
                { key: "homepage.identity.heading", label: "Heading", type: "text" },
                { key: "homepage.identity.lead", label: "Section description", type: "textarea", rows: 3 },
                { key: "homepage.identity.philosophyTitle", label: "Philosophy label", type: "text" },
                { key: "homepage.identity.philosophyBody", label: "Philosophy text", type: "textarea", rows: 4 },
                { key: "homepage.identity.filesTitle", label: "Editor tab label", type: "text" },
                { key: "homepage.identity.githubLabel", label: "GitHub link label", type: "text" },
                { key: "homepage.identity.githubPlaceholder", label: "GitHub placeholder", type: "text" },
                { key: "homepage.identity.files", label: "Code files JSON", type: "json", rows: 14, hint: "Array of { id, label, fileName, code }. Code uses \n for line breaks." },
              ]}
              onChange={updateFullObject}
            />
          </div>
        </Card>
      </Panel>
    ),

    appearance: (
      <Panel title="Fonts, Logo & Luxury Light Theme" sectionKeys={tabSections.appearance} description="The site uses a warm ivory luxury palette (#F7F6F2 / #B18A50) with Playfair Display and Instrument Serif. Change the font preset, logo, accent colors, glow, and motion here.">
        <Card>
          <ObjectEditor
            value={fullObject}
            fields={[
              { key: "appearance.logoPrimary", label: "Logo primary text", type: "text" },
              { key: "appearance.logoAccent", label: "Logo accent text", type: "text" },
              { key: "appearance.logoStyle", label: "Logo style", type: "select", options: logoOptions },
              { key: "appearance.fontPreset", label: "Typography preset", type: "select", options: fontOptions },
              { key: "appearance.animationLevel", label: "Animation level", type: "select", options: animationOptions },
              { key: "appearance.accentColor", label: "Primary accent", type: "color" },
              { key: "appearance.accentSecondary", label: "Secondary accent", type: "color" },
              { key: "appearance.backgroundIntensity", label: "Background glow intensity", type: "number", hint: "0–100. Higher means a warmer, more luminous ivory background." },
              { key: "appearance.showProfilePhoto", label: "Show profile photo", type: "toggle" },
              { key: "appearance.showCodeMotifs", label: "Show code/card motifs", type: "toggle" },
            ]}
            onChange={updateFullObject}
          />
        </Card>
        <Card>
          <h2 className="font-display text-lg font-semibold text-white">Live logo preview</h2>
          <div className="mt-5 flex flex-wrap items-center gap-8 rounded-xl border border-white/10 bg-[#efeee8] p-6">
            <span className={cn("font-display text-2xl font-bold tracking-[-0.055em] text-white", content.appearance.logoStyle === "serif" && "font-luxury font-semibold italic")}>{content.appearance.logoPrimary}<span className="text-electric">{content.appearance.logoAccent}</span></span>
            <span className="font-luxury text-3xl italic text-white">Aa</span>
            <span className="font-display text-3xl font-bold text-white">Aa</span>
            <span className="font-sans text-sm text-muted">Readable body text preview — 1234567890</span>
          </div>
        </Card>
      </Panel>
    ),

    seo: (
      <Panel title="SEO" sectionKeys={tabSections.seo} description="Browser title and meta description are updated live. Static metadata defaults remain in the project for crawlers.">
        <Card>
          <ObjectEditor value={fullObject} fields={[{ key: "seo.title", label: "Document title", type: "text" }, { key: "seo.description", label: "Meta description", type: "textarea", rows: 4 }, { key: "seo.siteUrl", label: "Public site URL", type: "url", placeholder: "https://your-domain.com" }]} onChange={updateFullObject} />
        </Card>
      </Panel>
    ),

    advanced: (
      <Panel title="Advanced JSON" sectionKeys={tabSections.advanced} description="Edit the complete content object, or export/import it to move edits between devices. Invalid JSON is not applied.">
        <Card>
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={downloadJson} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"><Download className="h-3.5 w-3.5" />Export JSON</button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"><Upload className="h-3.5 w-3.5" />Import JSON<input type="file" accept="application/json" className="sr-only" onChange={(event) => handleImportFile(event.target.files?.[0])} /></label>
            <button type="button" onClick={() => { if (window.confirm("Reset all browser-managed content to defaults?")) resetContent(); }} className="inline-flex items-center gap-2 rounded-full border border-[#d8a9a3] px-4 py-2 text-xs font-semibold text-[#a33a2f] hover:bg-[rgba(163,58,47,0.08)]"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
          </div>
          {importError && <p className="mb-3 flex items-center gap-2 text-xs text-[#a33a2f]"><AlertCircle className="h-3.5 w-3.5" />{importError}</p>}
          <JsonField rows={22} value={content} onChange={(parsed) => setContent((previous) => deepMerge(previous, parsed))} />
        </Card>
      </Panel>
    ),
  };

  return (
    <main className="admin-studio min-h-dvh bg-[#f7f6f2] text-[#171717]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 text-electric"><Settings2 className="h-4 w-4" /></span><div><p className="font-display text-sm font-semibold text-white">Content Studio</p><p className="text-[0.65rem] text-muted">MongoDB · Better Auth · Cloudinary</p></div></div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("hidden rounded-full border px-3 py-2 text-[0.65rem] lg:inline-flex", dirtyKeys.length ? "border-[#d8c9a9] bg-[rgba(177,138,80,0.08)] text-[#8a6a3b]" : "border-[#b9c9b3] bg-[rgba(95,122,95,0.08)] text-[#4f6b52]")}>{dirtyKeys.length ? `${dirtyKeys.length} unsaved` : "Saved"}</span>
            <button type="button" onClick={downloadJson} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-semibold text-white hover:bg-white/5"><Download className="h-3.5 w-3.5" /><span className="hidden sm:inline">Export</span></button>
            <Link href="/" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-semibold text-white hover:bg-white/5"><ExternalLink className="h-3.5 w-3.5" /><span className="hidden sm:inline">View site</span></Link>
            <button type="button" onClick={() => void logout()} disabled={loggingOut} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-semibold text-muted hover:text-white disabled:opacity-55"><LockKeyhole className="h-3.5 w-3.5" />{loggingOut ? "Signing out…" : "Sign out"}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {tabs.map((tab, index) => {
              const showGroup = index === 0 || tabs[index - 1].group !== tab.group;
              return (
                <div key={tab.id} className="shrink-0 lg:w-full">
                  {showGroup && <p className="mb-2 hidden px-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-muted/55 lg:block">{tab.group}</p>}
                  <button type="button" onClick={() => setActiveTab(tab.id)} className={cn("w-full whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition-colors", activeTab === tab.id ? "border border-electric/30 bg-electric/10 font-semibold text-white" : "border border-transparent text-muted hover:bg-white/5 hover:text-white")}>{tab.label}</button>
                </div>
              );
            })}
          </div>
        </aside>
        <section className="admin-studio__scroll min-w-0 max-w-full pb-16">{panels[activeTab]}</section>
      </div>
    </main>
  );
}
