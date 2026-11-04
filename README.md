# MARUF.B — Premium Creative Developer Portfolio

> 🚀 **শুরু করার একমাত্র গাইড (ZIP · VS Code localhost · manual git push · Vercel env):** [`START_HERE.md`](./START_HERE.md)

মারুফ বিল্লাহর জন্য তৈরি সম্পূর্ণ একক-পেইজ, **luxury light** থিমযুক্ত Next.js পোর্টফোলিও। প্যালেট `#F7F6F2` ivory, `#EFEEE8` sand, `#FFFFFF`, `#171717`, `#77756F`, `#B18A50` gold ও `#E5E2DA` hairline; Playfair Display + Instrument Serif italic + Inter/Manrope + Space Grotesk টাইপোগ্রাফি। শুরুতে ৩–৫ সেকেন্ডের skippable cinematic typed-code intro আছে। প্রজেক্টের সমস্ত কনটেন্ট centralized TypeScript data file থেকে আসে এবং অযাচাইকৃত তথ্য স্পষ্টভাবে editable placeholder হিসেবে দেখানো হয়।

## উন্নয়নের ধাপসমূহ (বাংলা)

সম্পূর্ণ phase-by-phase ব্যাখ্যা: [`REDESIGN_PHASES.md`](./REDESIGN_PHASES.md)।

> **GitHub-এ push করার পূর্ণ ধাপ:** [`GITHUB_PUSH_GUIDE.md`](./GITHUB_PUSH_GUIDE.md)
> **Admin/DB/Auth/Cloudinary (Step 2):** [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)

## দ্রুত শুরু

```bash
cd maruf-portfolio
npm install
npm run dev
```

Dev server: `http://localhost:3000`

> **Windows note:** Default `dev` ও `build` script এখন `next dev --webpack` / `next build --webpack` ব্যবহার করে, যাতে Windows x64-এ Turbopack native-binding error না হয়। Native binding ঠিক থাকলে ঐচ্ছিকভাবে `npm run dev:turbo` বা `npm run build:turbo` ব্যবহার করা যায়। VS Code/Windows setup-এর জন্য [`OPEN_IN_VSCODE.md`](./OPEN_IN_VSCODE.md) ও `fix-windows.ps1` দেখুন।

> **সবকিছু কাজ করার চেকলিস্ট:** [`MAKE_EVERYTHING_WORK.md`](./MAKE_EVERYTHING_WORK.md) · **নতুন admin/DB সেটআপ:** [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)

## No-code Content Studio

`/admin` খুলুন — নাম, ছবি, যোগাযোগ, social links, resume PDF, skills, education, experience, achievements, services, projects, **cinematic intro ও সব section headline**, fonts, logo, theme, animation ও SEO সব browser থেকেই এডিট করা যায় (**Homepage & Intro** tab)। বিস্তারিত: [`CONTENT_STUDIO.md`](./CONTENT_STUDIO.md)।

এখন **MongoDB Atlas + Better Auth + Cloudinary** ব্যবহার করে: `/login`-এ একমাত্র admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD`) দিয়ে ঢুকে প্রতিটি section-এ আলাদা **Save** করতে হয়। Public site-এ login লাগে না, সব write API server-side session-checked। পূর্ণ সেটআপ ও Vercel variable checklist: [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)।

Production checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## মোবাইল ডিজাইন (আলাদা করে বানানো)

শুধু desktop-কে ছোট করা হয়নি — 320–767px-এর জন্য আলাদা composition আছে:

- **Hero:** `HELLO, I'M` → নাম → **আসল ছবি (প্রথম স্ক্রিনেই)** → gold hairline frame + caption → headline → description → role → full-width CTA → social icons
- **Intro:** padded top bar, ছোট terminal, লম্বা কোড লাইন wrap হয়, welcome টাইপোগ্রাফি mobile-সাইজ
- **Behind the Code:** light code editor-এ লাইন wrap, ৪৪px Copy বাটন, tech stack ২ কলাম
- **Skills / About / Projects / Services:** কম্প্যাক্ট কিন্তু শ্বাস নেওয়া কার্ড, mobile-এ project image `16:11`, CTA full-width
- **পঠনযোগ্যতা:** কোনো লেবেল ১১px-এর নিচে নয়; button/link টার্গেট ≥ ৪২px; `/admin`-এর ১৫৮২px horizontal overflow ঠিক করা হয়েছে
- **যাচাই:** 320/360/375/390/414/425/768/1024/1440px → `overflow 0`, `hidden reveals 0`, `tiny text 0`, `console errors 0`

## প্রযুক্তি

- Next.js 16 App Router, React 19, TypeScript strict
- Tailwind CSS 4
- Framer Motion + GSAP ScrollTrigger + Lenis
- React Hook Form + Zod (client ও server validation)
- Resend server-side email delivery
- Lucide React + React Icons
- Next.js Image Optimization, next/font, Metadata API, sitemap, robots, JSON-LD

## গঠন

```text
src/app/                 layout, homepage, /projects/[slug], /api/contact, sitemap, robots
src/components/           layout, sections, animations, projects, ui, providers, contact
src/data/                সম্পাদনাযোগ্য সমস্ত কনটেন্ট (homepage copy সহ)
src/lib/                 utils, validation, resume check, structured data
src/types/               TypeScript interfaces
public/images/           আপনার আসল ছবি (JPG original + optimized WebP)
public/projects/         তিনটি abstract concept preview (স্ক্রিনশট নয়)
public/og-image.png      Open Graph / Twitter image
```

## কোথায় কী সম্পাদনা করবেন

| তথ্য | ফাইল |
| --- | --- |
| নাম, designation, bio, ছবি, ইমেইল/ফোন/WhatsApp, About | `src/data/personal.ts` |
| Social URLs | `src/data/social.ts` |
| Cinematic intro, hero headline, developer identity code files, section headings | `src/data/homepage.ts` |
| Navigation | `src/data/navigation.ts` |
| Skills ও proficiency | `src/data/skills.ts` |
| Education | `src/data/education.ts` |
| Experience / Development Journey | `src/data/experience.ts` |
| Achievements | `src/data/achievements.ts` |
| Services | `src/data/services.ts` |
| Projects, status, URLs, detail content | `src/data/projects.ts` |
| Public site URL | `.env.local` → `NEXT_PUBLIC_SITE_URL` |

`null` মান বা `EDIT:` দিয়ে শুরু হওয়া টেক্সট placeholder। UI-তে এগুলো disabled/dashed অবস্থায় দেখানো হয়; কোনো ভাঙা লিংক বা ভুয়া বাটন তৈরি হয় না।

## ছবি ও Resume

- আপনার আপলোড করা আসল ছবি: `public/images/maruf-billah-original.jpg`
- Next.js ব্যবহার করে: `public/images/maruf-billah.webp` (1200×1200) ও `maruf-billah-640.webp`
- Asset regenerate: `python3 scripts/generate-assets.py`
- Resume PDF যোগ করতে: `public/resume.pdf` ফাইলটি রাখুন এবং rebuild/redeploy করুন। Navbar/hero-এর download ও preview স্বয়ংক্রিয়ভাবে active হবে।
- Project cover বদলাতে `public/projects/`-এ আসল screenshot রাখুন ও `src/data/projects.ts`-এ `coverImage` আপডেট করুন।

## Contact form

`src/app/api/contact/route.ts` server-side Zod validation, honeypot, submission-time check, in-memory rate limit ও Resend integration ব্যবহার করে। Credentials না থাকলে API `503` দেয় এবং UI স্পষ্ট error দেখায়—কখনো false success নয়।

বিস্তারিত ম্যানুয়াল সেটআপ: [`SETUP.md`](./SETUP.md)

## বর্তমান অবস্থা

- [x] Complete homepage
- [x] Responsive navbar + mobile drawer
- [x] আসল প্রোফাইল ছবি
- [x] Animated hero
- [x] About, Skills, Education, Development Journey
- [x] 3 project concepts + dynamic detail pages
- [x] Achievements empty state, Services, Contact, Footer
- [x] Contact form client/server validation
- [x] Resume download/preview conditional structure
- [x] SEO metadata, sitemap, robots, JSON-LD
- [x] ESLint, TypeScript strict ও warning-free production build verified
- [x] No-code `/admin` Content Studio + MongoDB persistence + Better Auth single admin + Cloudinary uploads
- [x] Luxury light design system, Playfair/Instrument Serif typography, asymmetric editorial sections
- [x] 3-step cinematic typed-code intro (skip, sessionStorage, reduced-motion)
- [x] Interactive light code editor / "Behind the Code" developer identity section
- [x] Alternating large image-led project showcase + 4 skill categories
- [x] 320px–1920px responsive overflow ও console-error testing
- [x] মোবাইলের জন্য আলাদা hero composition, ১১px+ type scale, ৪২px+ touch targets, `/admin` overflow fix
- [ ] ব্যক্তিগত তথ্য/সোশ্যাল URL/education/experience/achievements প্রদান
- [ ] আসল `resume.pdf` প্রদান
- [ ] Resend configuration
- [ ] GitHub repository push
- [ ] Vercel deployment ও verified live URL

> GitHub push, Vercel deploy এবং Resend key creation-এ আপনার অ্যাকাউন্ট ও অনুমোদন প্রয়োজন। এজেন্ট নিজে থেকে অ্যাকাউন্ট তৈরি বা secret সংগ্রহ করে না।
