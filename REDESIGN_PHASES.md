# সম্পূর্ণ রিডিজাইন — ধাপ ধাপ ব্যাখ্যা (বাংলা)

> **MARUF BILLAH — WEB DEVELOPER** · Luxury Light Creative Developer Portfolio
> আগের ডিজাইন বাদ দিয়ে সম্পূর্ণ নতুন ভিজ্যুয়াল অভিজ্ঞতা তৈরি করা হয়েছে। কাজের backend, admin security, contact API, project routes ও centralized content ব্যবস্থা অক্ষত রাখা হয়েছে।

---

## ফেজ ১ — বিদ্যমান প্রজেক্ট অডিট

প্রথমে পুরো প্রজেক্টের গঠন পড়া হয়েছে: `src/app`, `src/components`, `src/data`, `src/lib`, `src/types`, `public/`, `/admin` ও পাঁচটি admin API route। বের করা হয়েছে কী কী **রাখতে হবে** এবং কী কী **বদলাতে হবে**।

| রাখা হয়েছে | বদলানো হয়েছে |
| --- | --- |
| Next.js 16 App Router, TypeScript strict, Tailwind 4 | পুরো `globals.css` design system |
| Signed single-admin session, logout, rate limit | সব section-এর markup/layout |
| `/api/contact` (Zod, honeypot, timing, Resend) | Hero, Navbar, Footer, Cards, Buttons |
| `/projects/[slug]` dynamic routes + sitemap/robots | Project showcase (card → alternating editorial rows) |
| Content Studio + `content/portfolio.json` | Preloader (এক লাইনের welcome → ৩-ধাপ cinematic intro) |
| আসল আপলোড করা ছবি (অপরিবর্তিত) | OG image, icon, তিনটি concept cover (light palette) |

**অডিটে পাওয়া সমস্যা:** পুরনো ডিজাইন dark-ভিত্তিক utility alias, একই ছবি/কার্ড বারবার, generic ৩-কলাম project grid, এবং `reveal--clip` এমন একটি CSS bug যা IntersectionObserver-এর সাথে deadlock তৈরি করত (clip-path 100% → intersectionRatio 0 → কনটেন্ট কখনো visible হতো না)।

---

## ফেজ ২ — নতুন ডিজাইন সিস্টেম

`src/app/globals.css` সম্পূর্ণ নতুন করে লেখা হয়েছে।

- **প্যালেট:** `#F7F6F2` main, `#EFEEE8` secondary, `#FFFFFF` pure, `#171717` text, `#77756F` muted, `#B18A50` gold accent, `#E5E2DA` border
- **টাইপোগ্রাফি:** Playfair Display (headings), **Instrument Serif** italic (highlight word), Inter/Manrope (body), Space Grotesk (technical labels) — `next/font/google` দিয়ে optimized
- **Atmosphere:** warm ivory gradient, অতি সূক্ষ্ম gold glow, fine grid, বড় ghost numeral ও `MARUF.B` watermark
- **কম্পোনেন্ট:** `premium-card` (square-ish 3px radius, hairline border), `dashed-placeholder`, `portrait-mat` (asymmetric gold hairline), `code-window` / `terminal-window` (এবার light), `editorial-link`, `showcase-media`
- `themeColor`, `color-scheme`, `icon.svg`, `og-image.png` — সব light/gold-এ আপডেট
- Default appearance: Editorial serif, `#B18A50` accent; Modern ও Current preset এখনো Content Studio-তে আছে

**Reveal bug fix:** `reveal--clip`-এর hidden state এখন opacity/transform; wipe animation শুধু `.is-visible` হওয়ার পর চলে। ফলে কোনো টেক্সট আর আটকে থাকে না।

---

## ফেজ ৩ — Cinematic Intro (সিগনেচার ফিচার)

`src/components/animations/Preloader.tsx` নতুন করে লেখা হয়েছে।

1. **Initial screen:** warm ivory, মাঝখানে light terminal, তিনটি muted window indicator, `welcome.ts` filename, line number, syntax highlighting ও blinking cursor-সহ character-by-character টাইপিং
2. **Welcome:** typing শেষে `Hello, World!` → `Welcome to my world.` → `Where creativity meets code.` — বড় Playfair + italic Instrument Serif
3. **Transition:** terminal উপরে fade/slide করে, পুরো overlay fade করে hero প্রকাশ পায় (মোট ~৪.৫ সেকেন্ড)

অতিরিক্ত আচরণ:

- **Skip intro** বাটন
- `sessionStorage` key `mb-intro-complete` → internal navigation / reload-এ আবার চলে না
- শুধু `/` তে চলে; `/admin` ও project detail-এ নেই
- `prefers-reduced-motion`-এ টাইপিং নেই, static welcome ~০.৯ সেকেন্ড
- Intro চলাকালীন scroll lock, শেষে Lenis আবার চালু
- সব লাইন/welcome/skip label Content Studio → **Homepage & Intro** থেকে editable; `{name}`/`{role}` auto-replace

---

## ফেজ ৪ — Hero পুনর্নির্মাণ

`src/components/sections/Hero.tsx` — editorial asymmetric composition:

- বাঁয়ে: `HELLO, I'M` eyebrow, letter-by-letter **MARUF BILLAH**, `01 / Introduction`, বড় headline **"Building *Digital Experiences* with Code & Creativity."** (italic serif gold highlight), verified description, ঘূর্ণায়মান designation, **Explore My Work** + **Download Resume**, social links
- ডানে: আপনার **আসল ছবি** `portrait-mat`-এ (সাদা mat + gold hairline + corner bracket), floating `CLEAN INTERFACES` / `INTERACTIVE DETAILS` label, light `developer.ts` code card, vertical portrait label, scroll indicator
- ছবির মুখ বা পরিচয় বদলানো হয়নি; শুধু professional crop/optimize
- 1440px-এ CTA প্রথম স্ক্রিনেই দেখা যায়; 375px-এ আলাদা mobile composition

---

## ফেজ ৫ — "Behind the Code" ডেভেলপার আইডেন্টিটি (নতুন section)

`src/components/sections/DeveloperIdentity.tsx` + `src/components/ui/CodeBlock.tsx`:

- Light, ইন্টারঅ্যাকটিভ code editor: তিনটি file tab (`profile.ts`, `stack.ts`, `experience.ts`), line number, syntax highlighting, tab বদলে animation, **Copy** বাটন (বাস্তব clipboard)
- বাস্তব, পড়াযোগ্য TypeScript snippet — decorative gibberish নয়
- ডানে developer philosophy, ৪টি technology category-র সারাংশ (official icons), GitHub লিংক (real URL না থাকলে disabled placeholder)
- সব টেক্সট ও code file `src/data/homepage.ts` + Content Studio থেকে editable

---

## ফেজ ৬ — বাকি সব section নতুন করে

| Section | নতুন রূপ |
| --- | --- |
| **About** — "More Than Just Code." | বড় serif pull-quote, verified facts table, ৮টি dashed editable placeholder card; ছবির পুনরাবৃত্তি নেই |
| **Skills** — "Tools of My Craft." | ৪ category: Frontend / Backend / Database / Development Tools; official icons, hover animation, কোনো বানানো proficiency নেই |
| **Education** | Editorial timeline, বড় year typography, verified-detail placeholder |
| **Experience** | Professional experience না থাকলে স্বয়ংক্রিয় **My Development Journey**; কোনো বানানো চাকরি নেই |
| **Projects** — "Selected Works." | বড় image-led **alternating rows** (ছোট কার্ড নয়), status, tech, Details button; Live Demo শুধু বাস্তব URL থাকলে |
| **Achievements** | সার্টিফিকেট empty state / verified cards |
| **Services** | নম্বর-সহ editorial row list, "Proposed offering" স্পষ্ট |
| **Contact** | "Let's Build Something Together." + working Zod/RHF form + placeholder contact rows |
| **Navbar / Footer** | `MARUF.B` serif logo, ৬টি link, gold active underline, আলাদা designed mobile drawer, premium footer |

`src/components/projects/ProjectDetails.tsx`-ও light editorial-এ রূপান্তরিত: overview, objectives, stack, features, process, challenges, solutions, improvements, conditional live/repo buttons, previous/next, back-to-projects — সব আগের মতোই কাজ করে।

---

## ফেজ ৭ — অ্যানিমেশন সিস্টেম

- Framer Motion: intro phase, name char-by-char, word-mask headings, rotating designation, image clip reveal, card hover, magnetic buttons, mobile drawer
- GSAP ScrollTrigger: parallax frame ও timeline progress
- Lenis smooth scroll (desktop, reduced-motion respect)
- CSS microinteractions, scroll progress bar (gold gradient)
- Varied reveal: up / left / right / clip-wipe / scale / blur / flip + words / chars / wave
- **Safety:** ৪.৫ সেকেন্ডে সব content visible, `animation=off` ও `prefers-reduced-motion` সমর্থিত, mobile-এ হালকা অ্যানিমেশন

---

## ফেজ ৮ — ফাংশনালিটি সংরক্ষণ (কোনো system পরিবর্তন নয়)

আপনার কথা অনুযায়ী ডিজাইন ছাড়া অন্য কোনো ফিচার/সিস্টেম বদলানো হয়নি:

- ✅ Signed single-admin session, PBKDF2 hash, HttpOnly cookie, logout, rate limit — অক্ষত
- ✅ `/admin` এখনো আছে, শুধু নতুন light luxury রূপ পেয়েছে + নতুন **Homepage & Intro** tab
- ✅ Contact API (Zod, honeypot, timing, Resend), কোনো false success নেই
- ✅ তিনটি `/projects/[slug]`, sitemap, robots, JSON-LD, SEO metadata
- ✅ Resume download/preview শুধু বাস্তব PDF থাকলে active
- ✅ সব centralized data, no-code editing, Export/Import JSON

---

## ফেজ ৯ — Responsive, Accessibility ও Asset

- Playwright দিয়ে **320 / 360 / 375 / 390 / 414 / 425 / 768 / 1024 / 1440 / 1920px** টেস্ট: সবগুলোতে `scrollWidth === clientWidth`, `body.scrollWidth === clientWidth`, `hiddenReveals: 0`, `tinyText: 0`, `console/page errors: []`
- Mobile-এ আলাদা drawer (বড় serif link), tablet/laptop/desktop-এ আলাদা grid
- মোবাইলের জন্য আলাদা hero composition: নাম → প্রথম স্ক্রিনেই আসল ছবি → headline → full-width CTA; কোড লাইন wrap; ১১px+ লেবেল; ৪২px+ ট্যাপ টার্গেট; `/admin`-এ body overflow ফিক্স
- Semantic heading, skip link, `aria-label`/`aria-disabled` placeholder, focus ring, reduced motion
- `scripts/generate-assets.py` নতুন light palette-এ চালানো হয়েছে: আসল ছবি থেকে WebP, তিনটি light concept cover, 1200×630 OG image, নতুন `icon.svg`

---

## ফেজ ১০ — ভেরিফিকেশন

```text
npm run lint                 → pass
npx tsc --noEmit             → pass
npm run build --webpack      → warning-free, 10 static pages + 8 dynamic routes
npm audit --omit=dev         → 0 vulnerabilities
Playwright                   → 7 widths, 0 overflow, 0 hidden reveals, 0 errors
Intro QA                     → typing ✓, welcome ✓, skip ✓, sessionStorage ✓,
                               no replay on internal nav ✓, reduced-motion ✓
Route QA                     → /, 3 projects, sitemap, robots, /admin → 200
```

Intro, hero, identity, projects, contact, mobile menu ও admin panel-এর screenshot নেওয়া ও ভিজ্যুয়ালি যাচাই করা হয়েছে।

---

## আপনার কাছ থেকে যা এখনো প্রয়োজন (কিছুই বানানো হয়নি)

1. **ব্যক্তিগত তথ্য** — নিজের ভাষায় পরিচয়, programming journey, শখ, ভবিষ্যৎ লক্ষ্য (About-এর ৮টি `EDIT:` field)
2. **Education** — প্রতিষ্ঠান, ডিগ্রি, বিভাগ, সাল, ফলাফল (ঐচ্ছিক)
3. **Experience** — বাস্তব চাকরির তথ্য, অথবা নিজের learning journey-র মাইলস্টোন
4. **Achievements** — সার্টিফিকেট/পুরস্কারের নাম, প্রতিষ্ঠান, তারিখ, verification URL
5. **যোগাযোগ** — ইমেইল, ফোন, WhatsApp; GitHub/LinkedIn/Facebook/Instagram/X-এর বাস্তব URL
6. **Resume** — আসল PDF (`public/resume.pdf` অথবা `/admin → Resume`-এ upload)
7. **Projects** — বাস্তব screenshot, verified build notes, আর কাজ করা Live/Repo URL (`Concept Preview` সরাতে)
8. **Email delivery** — Resend অ্যাকাউন্ট + verified domain + `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL` ([`SETUP.md`](./SETUP.md)-এ পূর্ণ ধাপ আছে)
9. **Deploy** — GitHub repo + Vercel (আপনি আগে `later` বেছে নিয়েছিলেন, তাই এখনো push/deploy করা হয়নি)

> বাস্তব তথ্য না দেওয়া পর্যন্ত সব জায়গায় স্পষ্ট **editable placeholder** দেখানো হয়; কোনো ভুয়া লিংক, ভুয়া বাটন, বানানো অভিজ্ঞতা বা false success নেই।
