# Content Studio — কোড না ছুঁয়ে পুরো পোর্টফোলিও manage করুন

> **Step 2 (MongoDB + Better Auth + Cloudinary) পূর্ণ সেটআপ, Vercel env checklist ও migration:** [`ADMIN_SETUP.md`](./ADMIN_SETUP.md) · সাধারণ চেকলিস্ট: [`MAKE_EVERYTHING_WORK.md`](./MAKE_EVERYTHING_WORK.md)

## কোথায় পাবেন

```text
http://localhost:3000/login    → admin sign in
http://localhost:3000/admin    → Content Studio
```

Footer ও mobile navigation drawer-তেও **Content Studio** লিংক আছে। Public site-এ login লাগে না; `/admin` ও সব write API session-protected।

## Login (Better Auth)

- **একজনই admin**: `ADMIN_EMAIL` + `ADMIN_PASSWORD` থেকে প্রথম request-ে অ্যাকাউন্ট তৈরি হয়। Public sign-up **বন্ধ** (`disableSignUp: true`)।
- ভুল password → `401`; cookie ছাড়া `/admin` → `/login`-এ redirect; cookie ছাড়া write API → `401`।
- Sign out → header-এ **Sign out**।

## ডাটা কোথায় থাকে

| আগে (বাতিল) | এখন |
| --- | --- |
| React state + `localStorage` + `content/portfolio.json` auto-save | **MongoDB Atlas**, প্রতিটি section-এর নিজস্ব collection `section_<key>` |
| Vercel-এ `writeFile` fail → `persistent:false` কিন্তু UI সফল | Server-side DB write; fail হলে স্পষ্ট error, কখনো false success নয় |
| প্রতি ডিভাইসে আলাদা localStorage | Desktop + mobile + admin — সবাই একই `GET /api/content` (`no-store`, `force-dynamic`) |
| base64 image browser-এ | **Cloudinary** signed server-side upload; `secure_url` + `public_id` DB-তে (`portfolio_assets`) |

**নিয়ম:** Database খালি থাকলেই শুধু built-in defaults দেখায়। DB-তে ডাটা থাকলে সবসময় DB-র মান জেতে — default কখনো override করে না।

## প্রতিটি section-এ Save

কোনো auto-save নেই। প্রতিটি tab-এ নিচে **Save this section** বাটন:

1. Edit করুন → header-এ `N unsaved` badge
2. **Save this section** → `Saving…` → `Saved N section(s) to the database.`
3. Save-এর পর UI আবার DB থেকে ডাটা নিয়ে দেখায়
4. Fail হলে লাল error message (কখনো success নয়)
5. Unsaved change রেখে পেজ ছাড়তে গেলে browser warning

`Overview`-এ **Migrate data** বাটন আছে — পুরনো localStorage/JSON ডাটা এক ক্লিকে MongoDB-তে নিয়ে যায় (কিছু হারায় না)। CLI-তেও: `npm run seed:content` / `node scripts/seed-content.mjs --file ./export.json`।

## যা যা এডিট করা যায়

| Tab | কী manage করবেন | Save হয় |
| --- | --- | --- |
| Overview | Data source, migration, quick actions | — |
| Profile & About | নাম, designation, bio, roles, profile photo, About intro/facts/৮টি field | `personal` |
| Homepage & Intro | typed terminal lines, welcome, skip label, hero headline (`*italic*`), portrait labels, section headings, Developer Identity code files | `homepage` |
| Links & Contact | ৫টি social URL, email/phone/WhatsApp, navigation | `socialLinks` · `navigation` · `personal` · id lists |
| Resume | PDF upload (Cloudinary), enable/disable, filename, label | `personal` |
| Skills | category, label, description, nested skills, icon keys, proficiency | `skillCategories` |
| Education | institution, degree, department, years, result, description | `educationEntries` · `educationPlaceholder` · `educationSection` |
| Experience | job/company/dates/responsibilities + Development Journey prompts | `experienceEntries` · `developmentJourney` |
| Achievements | certificate/issuer/date/image/verification URL | `achievements` · `achievementsSection` |
| Services | title, description, icon, proposed flag | `services` · `servicesSection` |
| Projects | slug, name, status, concept flag, cover upload, technologies, live/repo URLs, detail sections | `projects` · `projectsSection` |
| Fonts, Logo & Theme | font preset, logo, accent, glow, animation level, toggles | `appearance` |
| SEO | title, meta description, public site URL | `seo` |
| Advanced JSON | পুরো content object, Export/Import/Reset | সব section |

## Image upload (Cloudinary)

Admin-এ file বেছে নিলেই browser → `POST /api/admin/upload` (server-side signed) → Cloudinary → `secure_url` + `public_id` MongoDB-তে। Replace/Remove করলে পুরনো Cloudinary asset-ও destroy হয়। `CLOUDINARY_API_SECRET` কখনো frontend-এ যায় না; `next.config.ts`-এ `res.cloudinary.com` allow করা আছে। ছবি/PDF সর্বোচ্চ ৮ MB; অন্য টাইপ `400`।

## Broken-link নীতি

Social/contact/project URL খালি থাকলে button/icon disabled placeholder; কোনো ভাঙা লিংক তৈরি হয় না। শুধু বাস্তব `https://...` দিলেই active।

## Font, logo ও luxury light

সাইট **সম্পূর্ণ নতুন luxury light ডিজাইন**—warm ivory `#F7F6F2`, secondary `#EFEEE8`, pure white `#FFFFFF`, primary text `#171717`, secondary `#77756F`, accent gold `#B18A50`, hairline `#E5E2DA`। Dark background নেই; আছে সূক্ষ্ম gold glow, fine grid, editorial whitespace, asymmetric layout, refined border ও square-ish premium cards। Code editor-গুলোও light workspace (সাদা/ivory, গাড় সিনট্যাক্স রঙ), কোনো dark panel নেই।

`Fonts, Logo & Theme` tab-এ তিনটি preset আছে:

- **Editorial serif** — Playfair Display headings + **Instrument Serif italic** highlight + Inter/Manrope body (default)
- **Modern luxury** — Sora display + Inter body
- **Current** — Space Grotesk display + Inter body

Technical label-গুলো Space Grotesk-এ। Logo-র জন্য **Monogram**, **Luxury serif**, **Minimal text**—তিনটি style, সাথে primary/accent text এডিট করা যায়। Accent colors ও background glow intensity বদলে light theme-কে একঘেয়ে সাদা না রেখে dynamic কিন্তু readable রাখা যায়।

## Cinematic intro — `Homepage & Intro` tab

প্রথম ভিজিটে warm ivory screen-এ তিনটি window indicator-সহ একটি light terminal দেখা যায়:

1. `$ initializing maruf-portfolio...`, `$ loading developer-profile...` ও একটি বাস্তব `const developer = {...}` ব্লক character-by-character টাইপ হয়, syntax highlighting ও blinking cursor সহ।
2. এরপর `Hello, World!` → `Welcome to my world.` → `Where creativity meets code.` typography animation-এ আসে।
3. প্রায় ৪.৫ সেকেন্ডে terminal fade/slide করে hero-তে রূপ নেয়।

- উপরে **Skip intro** বাটন আছে
- সম্পন্ন হলে `sessionStorage`-এ `mb-intro-complete` save হয়, তাই internal navigation-এ বা reload-এ intro আবার চলে না (নতুন browser session-এ আবার দেখা যায়)
- `/admin` ও project detail page-এ intro একেবারেই নেই
- `prefers-reduced-motion`-এ টাইপিং বাদ দিয়ে static welcome দেখিয়ে দ্রুত সরিয়ে দেওয়া হয়
- লাইনগুলোতে `{name}` / `{role}` ব্যবহার করলে আপনার profile মান স্বয়ংক্রিয়ভাবে বসে
- সব লাইন, welcome text, skip label, hero headline ও section heading `Homepage & Intro` tab থেকে এডিট করা যায়; headline-এ `*asterisk*` দিলে শব্দটি italic serif gold হয়

## Behind the Code — interactive code editor

`Homepage & Intro` tab-এর **Code files JSON** দিয়ে তিনটি file (profile.ts / stack.ts / experience.ts) এডিট করা যায়। সাইটে file tab বদলালে panel animate হয়, **Copy** বাটন বাস্তব clipboard-এ কোড কপি করে, line number ও syntax highlighting আছে। GitHub URL না দেওয়া থাকলে সেখানে disabled placeholder দেখায়—কোনো ভাঙা লিংক নয়।

## Animation control

`Animation level` দিয়ে নির্বাচন করুন:

- `Full` — varied scroll reveals: up, left, right, clip, scale, blur, flip + word/char/clip/wave typography
- `Subtle` — একই animations, কিন্তু কম distance ও duration
- `Off` — কোনো scroll reveal নেই

System-wide safety আছে: JavaScript বা IntersectionObserver কোনো কারণে কাজ না করলে **সর্বোচ্চ ৪.৫ সেকেন্ডের মধ্যে সব content visible হয়ে যায়**। আগের মতো blur/opacity-তে আটকে থাকবে না। `prefers-reduced-motion`-ও respected।

## ছবি, code ও cards

- Hero-তে আপনার আসল ছবি asymmetric gold-hairline frame-এ আছে; চাইলে `Show profile photo` বন্ধ করে সেখানে code window দেখানো যায়। About-এ ছবির পুনরাবৃত্তি নেই—সেখানে typography ও cards আছে।
- Hero, About ও background-এ code/card motifs যোগ করা হয়েছে; `Show code motifs` দিয়ে বন্ধ করা যায়।
- Project cover-এ abstract **Concept Preview** আছে; `/admin → Projects` থেকে আসল screenshot upload করলে সঙ্গে সঙ্গে বদলে যাবে।
- Cover বা profile upload browser-managed data URL হিসেবে save হয়; বড় file-এর ক্ষেত্রে ২–৩ MB-এর নিচে রাখা ভালো।

## Resume without code

`/admin → Resume`-এ PDF upload করলেই:

- Hero/Navbar-এর download button active হয়
- Preview modal-এ PDF embed হয়
- `Enable uploaded resume` toggle automatically on হয়

চাইলে `public/resume.pdf` ও রাখা যায়; server-side check সেটিও detect করে।

## Export / Import / Reset

`Advanced JSON` tab-এ:

- **Export JSON** — পুরো content ডাউনলোড
- **Import JSON** — অন্য browser/device থেকে content নিয়ে আসা
- **Reset** — browser-managed override মুছে defaults ফিরিয়ে আনা

## Production persistence

MongoDB Atlas-ই একমাত্র source; refresh, browser close, অন্য device ও redeploy-এ ডাটা টিকে থাকে। Static metadata ও sitemap build-time defaults থেকে আসে, তাই SEO-র স্থায়ী পরিবর্তন চাইলে `CONTENT_STUDIO → SEO`-তে দেওয়া মান `src/data/site.ts`-এও বসিয়ে redeploy করুন।

