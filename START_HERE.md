# 🚀 START HERE — সম্পূর্ণ প্রজেক্ট, এক জায়গায়

> আপনি বলেছিলেন: **"আগের প্রজেক্টের সব ঠিক থাকবে, admin panel-এর সব কাজ করবে; আগেরটা GitHub ও Vercel থেকে ডিলিট দিয়েছি, এখন নতুন করে নেব; পুরো প্রজেক্টের ZIP দাও, VS Code-এ localhost কীভাবে খুলব এবং manual git push কীভাবে করব বলে দাও; MongoDB সহ যা যা লাগবে আমি নিজে Vercel-এ বসিয়ে deploy করব।"**
>
> এই ফাইলটাই সেই এক-জায়গার উত্তর। বাকি ডকগুলো বিস্তারিত রেফারেন্স।

---

## ০) আগেরটা কি ঠিক আছে? ✅ হ্যাঁ, সব আছে

**কিছুই মুছে/বদলে ফেলা হয়নি** (আপনার নিয়ম: "no file delete, existing design/feature ভাঙবে না")।

| আগে যা ছিল | এখন |
| --- | --- |
| Luxury light ডিজাইন (`#F7F6F2` / gold `#B18A50`), Playfair + Instrument Serif | ✅ অক্ষত |
| Cinematic typed intro (skip, sessionStorage, reduced-motion) | ✅ অক্ষত |
| Hero + আপনার আসল ছবি, Behind the Code editor, About, Skills, Education, Experience, Projects, Achievements, Services, Contact, Footer | ✅ অক্ষত |
| ৩টি `/projects/[slug]` detail page, sitemap, robots, SEO/OG/JSON-LD | ✅ অক্ষত |
| Contact form (Zod + Honeypot + Resend, loading/success/error, runtime diagnostic) | ✅ অক্ষত |
| 320–1920px responsive, mobile drawer, মোবাইলের আলাদা hero composition | ✅ অক্ষত |
| `/admin` Content Studio — সব ১৪টি tab | ✅ আছে, **উপরে আরও ভালো হয়েছে** |

**শুধু আপনি যেটা চেয়েছিলেন সেটাই বদলেছে (admin-এর ভেতরের সিস্টেম, ডিজাইন নয়):**
`localStorage → MongoDB`, `PBKDF2 → Better Auth`, `base64 → Cloudinary`, `auto-save → প্রতি section-এ Save`, আর `/admin`-এ wheel scroll ঠিক। Public সাইটের কোনো pixel বদলায়নি।

> আগের repo আপনি ডিলিট দিয়েছেন → এটা সম্পূর্ণ **fresh start**। কোনো পুরনো remote/conflict নেই।

---

## ১) ফুল প্রজেক্ট ZIP

```
/home/user/maruf-portfolio-source.zip     (~৭৫৫ KB)
```

ভেতরে **`maruf-portfolio/`** ফোল্ডার (nested — VS Code-এ ঢোকার জন্য ঠিক আছে)। ভেতরে আছে:

- `src/` (সব component, section, API route, `/login`, `proxy.ts`)
- `public/` (আপনার আসল ছবি + WebP + ৩টি concept cover + OG image + icon)
- `content/portfolio.json` (`{}` — খালি মানে site defaults দেখাবে)
- `package.json` + `package-lock.json` (সব dependency, version লক করা)
- `.env.example` (**খালি টেমপ্লেট**, কোনো key নেই)
- `scripts/seed-content.mjs` (পুরনো ডাটা MongoDB-তে নেওয়ার migration script)
- `fix-windows.ps1`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`
- সব গাইড: `START_HERE.md`, `ADMIN_SETUP.md`, `GITHUB_PUSH_GUIDE.md`, `OPEN_IN_VSCODE.md`, `SETUP.md`, `CONTENT_STUDIO.md`, `MAKE_EVERYTHING_WORK.md`, `REDESIGN_PHASES.md`, `README.md`

**ZIP-এ নেই (ইচ্ছাকৃত):** `.git`, `.env.local`, `node_modules`, `.next`, `content/admin-auth.json`, `content/*.dev.json`, `*.tsbuildinfo`, logs → **কোনো secret কোথাও যাচ্ছে না**।

> ⚠️ ZIP-এ `.git` নেই, তাই নিজের পিসিতে প্রথমবার `git init` লাগবে (ধাপ ৪-এ আছে)।

---

## ২) VS Code-এ localhost চালু (Windows / PowerShell) ⭐

### ২.১ প্রথমবার সেটআপ

```powershell
# ১) ZIP extract করুন, তারপর ভেতরের ফোল্ডারে ঢুকুন
cd maruf-portfolio

# ২) Git আছে কি? (2.x দেখালেই ঠিক)
git --version
node --version
npm --version
```
না থাকলে: Git → https://git-scm.com/download/win (**Git Credential Manager** টিক দিয়ে), Node → https://nodejs.org (LTS)।

```powershell
# ৩) dependency ইনস্টল (package-lock অনুযায়ী, কোনো নতুন package নয়)
npm install

# ৪) Windows native-binding/Turbopack সমস্যা হলে একবার চালান
powershell -ExecutionPolicy Bypass -File .\fix-windows.ps1
```
> `dev` ও `build` script আগেই `next dev --webpack` / `next build --webpack` — Windows x64-এ `@next/swc` error আসবে না।

### ২.২ `.env.local` বানান (admin locally চাইলে)

`.env.example` কপি করে `.env.local` নাম দিন, তারপর **নিজের মতো** ৩টি মান বসান:

```env
BETTER_AUTH_SECRET=একটা-লম্বা-র্যান্ডম-স্ট্রিং-যেমন-openssl-rand-base64-32
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=অন্তত-৮-অক্ষরের-নিজের-পাসওয়ার্ড
```

- `MONGODB_URI` **local-এ দিতে হবে না** → তখন automatic **dev fallback** চলে (Better Auth memory adapter + `content/sections.dev.json`)। ফলে MongoDB ছাড়াই localhost-এ login → edit → Save → refresh সব টেস্ট করা যায়।
- Vercel-ে `MONGODB_URI` দিলেই আসল MongoDB Atlas ব্যবহার হয়; dev fallback Vercel-ে কখনো চলে না।
- `.env.local` `.gitignore`-এ আছে → কখনো Git-এ যাবে না। চ্যাটেও পাঠাবেন না।

### ২.৩ Dev server চালু

```powershell
npm run dev
```
Ready দেখলে **ব্রাউজারে** যান:

| যেতে চান | URL |
| --- | --- |
| সাইট | `http://localhost:3000` |
| Admin sign in | `http://localhost:3000/login` |
| Content Studio | `http://localhost:3000/admin` |
| API diagnostic | `http://localhost:3000/api/content` |

```powershell
# URL টাইপ করে কমান্ড হিসেবে চালাবেন না; চাইলে:
Start-Process "http://localhost:3000"
```

> ⚠️ `http://localhost:3000` PowerShell-এ **কমান্ড নয়** — আগেও এই ভুলটা হয়েছিল। ব্রাউজারের address bar-এ paste করুন।

`/login`-ে `.env.local`-এর `ADMIN_EMAIL` + `ADMIN_PASSWORD` দিয়ে ঢুকে যেকোনো tab-এ edit → **Save this section** → refresh → ডাটা থাকবে। বন্ধ করতে `Ctrl+C`।

### ২.৪ Production-মতো করে যাচাই (ঐচ্ছিক)

```powershell
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

---

## ৩) Manual Git Push → GitHub (নিজের হাতে)

> Arena-তে GitHub connector নেই (`unsupported`) এবং আমি আপনার টোকেন চাইছি না — push আপনিই করবেন। আমি শুধু commit করেছি, **push করিনি**।

### ৩.১ GitHub-এ খালি repo

👉 https://github.com/new → Owner আপনি, নাম `maruf-portfolio`, Public/Private যেটা চান → **README / .gitignore / license কোনোটিই টিক দেবেন না** → **Create repository** → HTTPS URL কপি:
```
https://github.com/YOUR-USERNAME/maruf-portfolio.git
```

### ৩.২ Authentication (একবার)

GitHub-এ অ্যাকাউন্ট password দিয়ে আর push হয় না। **সহজ উপায়:** `git push`-এ GCM browser খুলবে → sign in → Authorize।

PAT চাইলে: https://github.com/settings/personal-access-tokens → **Fine-grained tokens → Generate new token** → নাম/মেয়াদ → **Only select repositories → `maruf-portfolio`** → **Contents: `Read and Write`** → Generate → `github_pat_…` কপি (একবারই দেখা যায়)। `git push`-এ username = আপনার username, **password = এই token**।

### ৩.৩ কমান্ড (কপি-পেস্ট)

```powershell
cd maruf-portfolio

git init -b main
git config user.name "আপনার নাম"
git config user.email "আপনার-GitHub-ইমেইল"

git add .
git commit -m "Initial commit — Maruf Billah luxury light portfolio"

git remote add origin https://github.com/YOUR-USERNAME/maruf-portfolio.git
git remote -v
git push -u origin main
```

সফল হলে `branch 'main' set up to track 'origin/main'` দেখবেন। যাচাই:
```powershell
git status
git ls-files | Select-String -Pattern "\.env|admin-auth|sections.dev|assets.dev"
# শুধু .env.example আসা উচিত
```

**পরে আপডেট পাঠাতে:** `git add .` → `git commit -m "…"` → `git push` (Vercel auto-redeploy হয়ে যাবে)।

> চাইলে Arena workspace থেকেও push করা যায় (সেখানে branch `fix/admin-mongodb-sync`-এ ১৩টি commit আছে, শুধু remote নেই): `git remote add origin …` → `git push -u origin fix/admin-mongodb-sync` অথবা `git branch -M main && git push -u origin main`। তবে নিজের পিসির ZIP পথটাই সহজ।

---

## ৪) Vercel Deploy — আপনি নিজে যা যা বসাবেন

1. https://vercel.com/new → **Import Git Repository** → `maruf-portfolio` → **Deploy**
2. Project → **Settings → Environment Variables**-এ নিচেরগুলো বসান (**Production** + চাইলে Preview) → **অবশ্যই Redeploy** (variable যোগ করলে চলমান deploy-এ পৌঁছায় না)

```env
# ── MongoDB Atlas (Mongoose + Better Auth adapter) ──
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net
MONGODB_DB=maruf_portfolio

# ── Better Auth (একজন admin) ──
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=<নিজের-শক্তিশালী-পাসওয়ার্ড-৮-অক্ষর-মিনিমাম>

# ── Cloudinary (server-side signed upload) ──
CLOUDINARY_CLOUD_NAME=<Cloudinary Dashboard>
CLOUDINARY_API_KEY=<Cloudinary Dashboard>
CLOUDINARY_API_SECRET=<Cloudinary Dashboard — কখনো NEXT_PUBLIC_ নয়>

# ── Site / Contact (Resend) ──
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
RESEND_API_KEY=<resend.com/api-keys>
CONTACT_TO_EMAIL=<যে ইনবক্সে মেসেজ যাবে>
CONTACT_FROM_EMAIL=<Resend-এ verified domain-এর ঠিকানা>
```

**MongoDB Atlas-এ একটা কাজ:** Network Access-এ Vercel-এর IP allow করুন (অথবা `0.0.0.0/0`), আর Database User-এর password-টা উপরের URI-তে বসান।

**Deploy-এর পর:**
1. `https://your-domain/login` → `ADMIN_EMAIL` / `ADMIN_PASSWORD`
2. `/admin → Overview → Migrate data` (যদি পুরনো browser/JSON ডাটা থাকে; না থাকলে দরকার নেই — DB খালি থাকলে site defaults দেখায়)
3. প্রতিটা tab-এ edit → **Save this section**
4. `/` refresh করলেই সব ডিভাইসে একই MongoDB ডাটা

> ✅ **Push-এর সময় এসব key-এর কোনোটিই লাগে না** — এগুলো শুধু Vercel-এ। কোডে/ZIP-এ/Git-এ কোনো secret নেই।

---

## ৫) সাধারণ সমস্যা → ১ লাইনে সমাধান

| দেখছেন | করণীয় |
| --- | --- |
| `cd maruf-portfolio` কাজ করে না | ZIP extract করেননি / ভুল ফোল্ডার — ভেতরের `maruf-portfolio/`-এ ঢুকুন |
| `@next/swc-win32-x64-msvc` / Turbopack error | `powershell -ExecutionPolicy Bypass -File .\fix-windows.ps1` (default আগেই `--webpack`) |
| `http://localhost:3000` কমান্ড নয় | ব্রাউজারে paste, বা `Start-Process "http://localhost:3000"` |
| `/login`-এ sign-in কাজ করে না | `.env.local`-এ `BETTER_AUTH_SECRET` + `ADMIN_EMAIL` + `ADMIN_PASSWORD` আছে কি; dev server **restart** করুন |
| `/admin` সরাসরি `/login`-এ চলে যায় | এটাই নিরাপদ আচরণ — আগে sign in করুন |
| Contact form "Email delivery is not configured" | Vercel-এ ৩টি Resend variable + **Redeploy** + `CONTACT_FROM_EMAIL`-এর domain verified |
| `remote origin already exists` | `git remote set-url origin https://github.com/USER/REPO.git` |
| `Authentication failed` | GCM browser login, বা নতুন fine-grained PAT (`Contents: Read and Write`); Windows Credential Manager-এ পুরনো GitHub entry মুছুন |
| `failed to push some refs` | repo-তে README টিক দিয়েছিলেন → খালি করে আবার বানান, বা `git pull origin main --allow-unrelated-histories` |
| `src refspec main does not match any` | আগে `git add . && git commit -m "…"`, তারপর `git branch -M main` |
| Vercel-এ env বসিয়েও পুরনো মান | **Redeploy** করুন — চলমান deployment পুরনো env রাখে |

---

## ৬) সব ডকের মানচিত্র

| চাই | ফাইল |
| --- | --- |
| **এই সব-এক-জায়গার গাইড** | `START_HERE.md` |
| VS Code / Windows খোলার বিস্তারিত | `OPEN_IN_VSCODE.md` |
| GitHub push-এর পূর্ণ ধাপ + troubleshoot | `GITHUB_PUSH_GUIDE.md` |
| MongoDB / Better Auth / Cloudinary আর্কিটেকচার + Vercel checklist + migration | `ADMIN_SETUP.md` |
| Admin panel ব্যবহার (প্রতি tab-এ কী, Save, image) | `CONTENT_STUDIO.md` |
| সব ফিচার active করার চেকলিস্ট | `MAKE_EVERYTHING_WORK.md` |
| Resend / domain / deploy বিস্তারিত | `SETUP.md` |
| ডিজাইন ধাপসমূহ (বাংলা) | `REDESIGN_PHASES.md` |
| সংক্ষিপ্ত ওভারভিউ | `README.md` |

---

### এক লাইনে
**ZIP নিন → extract → `npm install` → `.env.local` → `npm run dev` → ব্রাউজারে `http://localhost:3000` → `git init`/`commit`/`remote add`/`git push` → Vercel Import + উপরের env + Redeploy → `/login`।** আগের প্রজেক্টের সবকিছু অক্ষত, admin-এর সব কাজ নতুন backend-এ চলছে। কোনো secret কোডে বা Git-এ নেই, কোনো ফাইল মোছা হয়নি, **push আমি করিনি — আপনি করবেন**।
