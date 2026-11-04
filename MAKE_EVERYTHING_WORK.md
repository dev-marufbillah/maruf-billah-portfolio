# সবকিছু কাজ করার গাইড + অ্যাডমিন প্যানেলে কীভাবে যাবেন

> সংক্ষেপে: **সাইটের সব সিস্টেম এখনই কাজ করে**। যেগুলো "কাজ করছে না" বলে মনে হয়, সেগুলো ইচ্ছাকৃতভাবে **আসল তথ্য/ফাইল/API key না থাকায় বন্ধ রাখা placeholder** — ভুয়া বাটন বা ভাঙা লিংক নয়। নিচের ধাপগুলো শেষ করলেই সব active হয়ে যাবে।

---

## ১. এখনই যা কাজ করে (আপনার কিছু করতে হবে না)

| জিনিস | অবস্থা |
| --- | --- |
| Cinematic typed intro, skip, sessionStorage, reduced motion | ✅ |
| Navbar, ৬টি section link, mobile drawer, smooth scroll | ✅ |
| Hero, Behind the Code editor (tab + Copy), About, Skills, Timeline, Projects, Services, Footer | ✅ |
| ৩টি `/projects/[slug]` detail page + previous/next | ✅ |
| Contact form-এর client + server validation, honeypot, timing, rate limit | ✅ |
| `/admin` Content Studio + MongoDB + Better Auth + Cloudinary | ✅ |
| SEO, OG/Twitter, sitemap, robots, JSON-LD, 320–1920px responsive | ✅ |
| `npm run lint` / `tsc` / production build / `audit` | ✅ |

---

## ২. অ্যাডমিন প্যানেলে কীভাবে যাবেন

ঠিকানা সব জায়গায় একটিই: **`/admin`**

### A. Arena লাইভ প্রিভিউ (আপনি এখন যেখানে আছেন)

1. প্রিভিউ URL-এর শেষে `/admin` বসান — যেমন `https://3000-xxxxx.e2b.app/admin`
   - অথবা সাইটের **Footer → Studio** লিংকে ক্লিক করুন
   - অথবা মোবাইলে ☰ মেনু → **Content Studio**
2. **প্রথমবার** `Secure your Content Studio` স্ক্রিন আসবে → **Create admin password**-এ নিজের একটি পাসওয়ার্ড দিন (কমপক্ষে ৮ অক্ষর) → নিচে আবার একইটা দিন → **Create password & unlock**।
3. এরপর থেকে ওই পাসওয়ার্ড ছাড়া কেউ edit করতে পারবে না। পরের বার এসে শুধু **Admin password → Unlock editor**।
4. উপরে ডানে **Lock** বাটন = logout।

**নিরাপত্তা (নতুন):** Better Auth + MongoDB adapter, public sign-up বন্ধ, একমাত্র admin `/login`-এ ইমেইল/পাসওয়ার্ড দিয়ে ঢোকেন। Proxy + server-side `requireAdmin()` সব write API আটকায়। কোনো secret chat/Git/ZIP-এ যায় না। বিস্তারিত: [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)।

> পাসওয়ার্ড ভুলে গেলে: প্রজেক্টের `content/admin-auth.json` ফাইলটি মুছে server restart করুন (অথবা আমাকে বলুন)। নতুন করে একবার সেট করতে হবে।

### B. নিজের কম্পিউটার (VS Code / Windows)

```powershell
cd maruf-portfolio
npm install
npm run dev
```

এরপর **ব্রাউজারে** যান: `http://localhost:3000/admin`

> ⚠️ PowerShell-এ `http://localhost:3000/admin` টাইপ করবেন না — সেটা command নয়। ব্রাউজারের address bar-এ paste করুন, অথবা `Start-Process "http://localhost:3000/admin"`।

Localhost-এ প্রথমবার `/admin` সরাসরি খুলবে (local browser mode)। চাইলে উপরে **Set password** দিয়ে local-কেও lock করে নিন; তারপর থেকে password দিয়ে login করতে হবে।

### C. Vercel / অন্য hosted deployment

Vercel-এ browser থেকে প্রথমবার password সেট করা **বন্ধ** থাকে (filesystem persistent নয়)। আগে Environment Variables-এ দিন:

```env
ADMIN_PASSWORD=একটি-শক্তিশালী-পাসওয়ার্ড
ADMIN_SESSION_SECRET=ঐচ্ছিক-লম্বা-র্যান্ডম-স্ট্রিং
```

Redeploy → `https://আপনার-ডোমেইন/admin` → password দিয়ে **Unlock editor**। `ADMIN_SESSION_SECRET` না দিলে `ADMIN_PASSWORD` থেকেই session sign হবে।

### D. ভেতরে কী পাবেন

| Tab | কী এডিট করবেন |
| --- | --- |
| Overview | save status, quick actions |
| Homepage & Intro | typed terminal লাইন, Hello/World welcome, skip label, hero headline (`*italic*`), section headings, code files |
| Profile & About | নাম, ছবি, designation, roles, bio, ৮টি About field |
| Links & Contact | ইমেইল/ফোন/WhatsApp + ৫টি social URL + navigation |
| Resume | PDF upload + enable |
| Skills / Education / Experience / Achievements / Services / Projects | সব কনটেন্ট, status, URLs, detail sections |
| Fonts, Logo & Theme | font preset, logo, gold accent, glow, animation level, photo/code toggle |
| SEO | title, description, site URL |
| Advanced JSON | Export / Import / Reset |

Auto-save নেই। প্রতিটি section-এ **Save this section** বাটন → loading → `Saved N section(s) to the database.`; fail হলে স্পষ্ট error, কখনো false success নয়।

---

## ৩. "সবকিছু কাজ করার" চেকলিস্ট

### ধাপ A — শুধু অ্যাডমিনে আসল তথ্য বসান (কোনো অ্যাকাউন্ট লাগবে না)

| যেটা active হবে | কোথায় বসাবেন | ফলাফল |
| --- | --- | --- |
| নিজের পরিচয়, journey, শখ | Profile & About → ৮টি `EDIT:` field | `EDIT:` placeholder চলে যাবে |
| Intro লেখা, hero headline, section title | Homepage & Intro | `*asterisk*` দিলে italic gold serif |
| ইমেইল / ফোন / WhatsApp | Links & Contact | row ক্লিকযোগ্য `mailto:`/`tel:` হবে |
| GitHub/LinkedIn/Facebook/Instagram/X | Links & Contact → real `https://...` | icon clickable হবে; খালি থাকলে disabled placeholder |
| Education / Experience / Achievements | নিজ নিজ tab | empty state → আসল timeline/card |
| Skills proficiency (যাচাইকৃত) | Skills | শতাংশ শুধু দিলেই দেখাবে |
| **Resume download + Preview** | Resume → PDF upload → `Enable uploaded resume` ON | Hero/Navbar-এর বাটন active; Preview modal-এ PDF |
| Project cover | Projects → cover upload | Concept Preview → আসল screenshot |
| **Live Demo / GitHub Repository** | Projects → `liveUrl` / `repoUrl` | শুধু বাস্তব, কাজ করা URL দিলেই বাটন দেখা যাবে |
| Font/logo/accent/animation/SEO | Fonts, Logo & Theme / SEO | সঙ্গে সঙ্গে বদলে যাবে |

> বিকল্প: resume `public/resume.pdf` নামে রেখে `npm run build` করলেও server সেটা detect করে।

### ধাপ B — Contact form থেকে আসল ইমেইল যাওয়া (একমাত্র বাহ্যিক সার্ভিস)

**সার্ভিস:** [Resend](https://resend.com)  
**কেন লাগে:** ব্রাউজার থেকে সরাসরি ইমেইল পাঠানো যায় না এবং API key ক্লায়েন্ট-সাইডে রাখা নিরাপদ নয়। তাই `/api/contact` Route Handler সার্ভার-সাইডে Resend দিয়ে মেসেজ পাঠায়।  
**খরচ:** Free `$0/মাস` — ৩,০০০ ইমেইল/মাস, ১০০/দিন, ৩টি domain, ৩টি inbox; Pro `$20/মাস` — ৫০,০০০ ইমেইল/মাস ([official pricing](https://resend.com/pricing))। শুরুতে Free-ই যথেষ্ট।

**ধাপ ধাপ (আপনি নিজে করবেন; আমি অ্যাকাউন্ট/কী বানাই না):**

1. https://resend.com/signup → অ্যাকাউন্ট তৈরি → ইমেইল verify
2. **Domains → Add domain** → আপনার ডোমেইন → Resend-এর দেখানো **DKIM/SPF TXT/CNAME** রেকর্ডগুলো আপনার DNS provider-এ বসান → **Verify**
3. **API Keys → Create API Key** → permission `Send emails` → `re_...` কীটি কপি করুন (একবারই দেখানো হয়)
4. প্রজেক্ট রুটে `.env.local` বানান (এই ফাইল Git-এ যাবে না; `.env.example` শুধু টেমপ্লেট):

   ```env
   RESEND_API_KEY=re_আপনার_কী
   CONTACT_TO_EMAIL=আপনি-যেখানে-মেসেজ-পাবেন@yourdomain.com
   CONTACT_FROM_EMAIL=portfolio@yourdomain.com
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   - `CONTACT_FROM_EMAIL` অবশ্যই **verified domain**-এর অ্যাড্রেস হতে হবে (Resend-এ আলাদা sender বানাতে হয় না)।
   - Vercel হলে একই ৪টি **Project → Settings → Environment Variables**-এ দিন; `NEXT_PUBLIC_SITE_URL` = `https://আপনার-ডোমেইন`।
5. Dev server **restart** করুন (`Ctrl+C` → `npm run dev`) অথবা Vercel-এ **Redeploy**।
6. `/#contact`-এ ফর্ম ফিল করে পাঠান। **সাফল্য শুধু তখনই** যখন API `{ "ok": true }` দেয়। Credentials না থাকলে এখন API `503` + স্পষ্ট বার্তা দেয় — কখনো false success দেখায় না।

> কী বা পাসওয়ার্ড কখনো চ্যাটে পাঠাবেন না। আপনি সেটআপ শেষে বললেই আমি শুধু যাচাই করে দেব।

### ধাপ B-2 — Contact Form "Send Message কিছুই করে না" — ডিবাগ ও ফিক্স (সম্পন্ন)

**Root cause (Playwright দিয়ে reproduce করা হয়েছে):**

1. **প্রধান কারণ (client):** hidden `startedAt` ফিল্ড ও `formReady` flag শুধু `requestAnimationFrame`-এর ভেতরে set হত। Background tab / throttled rAF / cancelled frame হলে `formReady = false` থেকে যেত → **Send বাটন চিরতরে `disabled`**, আর `startedAt = ""` থাকায় Zod hidden-field validation চুপচাপ fail করত → কোনো request, কোনো error, কোনো success — ঠিক যা রিপোর্ট করা হয়েছিল।
2. **দ্বিতীয় কারণ (server/runtime):** সার্ভারে `RESEND_API_KEY` / `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` না থাকলে API `503` দেয়। Vercel-এ variable যোগ করার পর **নতুন deploy না করলে** চলমান deployment-এ সেগুলো পৌঁছায় না; Production environment-এ enable থাকতে হয়। `CONTACT_FROM_EMAIL`-এর domain Resend-এ verified না হলে `502`।
3. badge-টা `layout.tsx`-এ **build time**-এ compute হত → static HTML-এ পুরনো "Setup required" আটকে যেত।

**যা ঠিক করা হয়েছে (ডিজাইন অপরিবর্তিত):**

- `startedAt` এখন সরাসরি effect-এ set হয় (rAF-নির্ভর নয়), tab focus-এ refresh হয়; `formReady` gate বাদ → বাটন শুধু loading-এ disabled।
- `handleSubmit(onSubmit, onInvalid)` → hidden/field validation fail হলে এখন **দৃশ্যমান error** দেখায় (আগে নীরব ছিল)।
- `GET /api/contact` → runtime diagnostic (`configured`, `missing` — শুধু variable-এর নাম, কোনো secret নয়)। Form সেটা fetch করে badge/banner আপডেট করে, তাই build-time stale flag আর নেই।
- `POST /api/contact`-এ `dynamic = "force-dynamic"`, env প্রতি request-এ পড়া, trim, missing-নামসহ স্পষ্ট 503, Resend error-তে স্পষ্ট 502, `data.id` চেক; rate-limit quota misconfiguration-এ নষ্ট হয় না।
- ১৫ সেকেন্ডের `AbortController` timeout → request আটকে গেলে "Sending..." আটকে থাকে না; success/error box `role="status"/"alert"` + `scrollIntoView` → মেসেজ নিশ্চিত দেখা যায়; success শুধু `{ok:true}`-তেই।
- `to` সবসময় **`CONTACT_TO_EMAIL`**; ভিজিটরের ইমেইল শুধু `replyTo`। API key শুধু server-side।

**কীভাবে টেস্ট করবেন (local):**

```bash
npm run lint && npx tsc --noEmit && npm run build
npm run start
curl http://localhost:3000/api/contact          # {"configured":false,"missing":[...]}
curl -X POST -H 'Content-Type: application/json' -d '{"name":"Test Person","email":"test@example.com","subject":"Project inquiry","message":"This is a sufficiently long test message for validation.","company":"","startedAt":"<1500ms আগের timestamp>"}' http://localhost:3000/api/contact
```

Vercel-এ আসল key বসিয়ে **Redeploy** করার পর `/#contact`-এ ফর্ম পূরণ → `Sending...` → `Your message was sent successfully.` → ইনবক্সে মেইল। Credentials ছাড়া কখনো false success দেখায় না।

> ⚠️ Vercel checklist: তিনটি variable **Production**-এ set আছে কি, পরে **Redeploy** হয়েছে কি, `CONTACT_FROM_EMAIL`-এর domain Resend-এ **Verified** কি — এই তিনটিই "env দিলাম কিন্তু মেইল এলো না"-র সবচেয়ে সাধারণ কারণ।

### ধাপ C — সাইট ইন্টারনেটে লাইভ করা

> GitHub-এ কোড push-এর **পূর্ণ ধাপ (অ্যাকাউন্ট, token/GCM/SSH, repo তৈরি, কমান্ড, error fix):** [`GITHUB_PUSH_GUIDE.md`](./GITHUB_PUSH_GUIDE.md)

- **GitHub** — Free `$0`, unlimited public/private repo ([pricing](https://github.com/pricing)): নতুন repo → `git remote add origin ...` → `git push`
- **Vercel** — Hobby free, automatic HTTPS, preview deploy ([plans](https://vercel.com/docs/plans)): **Add New → Project → Import** GitHub repo → ওপরের ৪টি + `ADMIN_PASSWORD` env var → **Deploy**
- Deploy-এর পর `https://আপনার-ডোমেইন/admin` গিয়ে login

> আপনি আগে `later` বেছে নিয়েছিলেন, তাই GitHub push / Vercel deploy এখনো করা হয়নি। বললেই exact কমান্ড ও ধাপ দেব — কিন্তু অ্যাকাউন্ট ও অনুমোদন আপনারই দিতে হবে।

### ধাপ D — শেষে একবার যাচাই

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

| চেক | প্রত্যাশিত ফল |
| --- | --- |
| `/admin` | `200` + editor unlock |
| Contact form submit | `200 {"ok":true}` এবং ইনবক্সে মেসেজ |
| Resume | download + preview দুটোই কাজ করে |
| Social icon / Live Demo | শুধু বাস্তব URL-এ ক্লিকযোগ্য |
| `/sitemap.xml`, `/robots.txt` | `200` |
| 320 / 375 / 768 / 1440 / 1920px | কোনো horizontal overflow নেই |

---

## ৪. মনে রাখবেন

- **কোনো তথ্য বানানো হয়নি** — নাম/লোকেশন/designation ছাড়া সব `EDIT:` বা dashed placeholder। আসল তথ্য দিলেই active হয়।
- **Vercel-এ** MongoDB Atlas-ই একমাত্র source → সব ডিভাইসে একই content; `Advanced JSON → Export JSON` শুধু backup।
- `/admin` search engine-এ `noindex`; `/api/`-ও robots-এ ব্লক করা।
- `.env*` ফাইল Git-এ ও ZIP-এ নেই; শুধু `.env.example` আছে (ভেতরে কোনো secret নেই)।

বিস্তারিত: [`CONTENT_STUDIO.md`](./CONTENT_STUDIO.md) · [`SETUP.md`](./SETUP.md) · [`REDESIGN_PHASES.md`](./REDESIGN_PHASES.md) · [`OPEN_IN_VSCODE.md`](./OPEN_IN_VSCODE.md)
