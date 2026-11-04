# Admin / MongoDB / Better Auth / Cloudinary — সেটআপ ও আর্কিটেকচার (Step 2)

> এই ফাইলটা Step 2-এর একমাত্র সত্য উৎস। পুরনো নোটে `localStorage`, `content/portfolio.json` auto-save, PBKDF2 password বা browser-first mode-এর কথা ছিল — সেগুলো এখন **বাতিল**।

## ১) কী বদলেছে (root cause → fix)

| আগের সমস্যা | Root cause | এখন |
| --- | --- | --- |
| Save/refresh-এ ডাটা উধাও | `ContentProvider` প্রতিবার `deepMerge(defaults, localStorage)` করত → ফাইল/সার্ভারের ডাটা browser cache দিয়ে override হত; Vercel-এ `writeFile` fail করলেও API `{ok:true, persistent:false}` পাঠাত (false success) | MongoDB-তে per-section collection; public `/api/content` `no-store` + `force-dynamic`; localStorage কেবল migration-এর জন্য, কখনো source নয় |
| PC-তে দেখা যায়, mobile-এ না | প্রতিটি ডিভাইসের নিজস্ব `localStorage` | Desktop + mobile + admin — সবাই একই `GET /api/content` |
| প্রতি section-এ Save নেই | শুধু ৬৫০ms debounce auto-save | প্রতিটা tab-এ নিজস্ব **Save this section** + loading / success / error; fail হলে কখনো success নয় |
| Wheel/touchpad-এ scroll হয় না | `SmoothScroll`-এর Lenis `/admin`-এও active ছিল → wheel `preventDefault()` + mount-এ cached scroll limit; tab বদলে কনটেন্ট বাড়লে limit refresh হত না | `/admin` ও `/login`-এ Lenis বন্ধ → একটিমাত্র native scroll container, `100dvh`, sidebar sticky কিন্তু block করে না |
| Image permanent নয় | base64 data URL → `localStorage` / JSON, Vercel-এ ephemeral | Server-side **signed** Cloudinary upload; `secure_url` + `public_id` MongoDB-তে; replace/delete-এ পুরনো asset destroy |
| Auth দুর্বল/আলাদা | নিজের লেখা PBKDF2 + signed cookie, local-এ login ছাড়াই edit | **Better Auth** + MongoDB adapter, `disableSignUp: true`, exactly একজন admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD` থেকে seed), middleware/proxy + server-side session check |
| Cache | `/api/admin/content` `no-store` ছিল, কিন্তু static HTML-এ `<title>` build-time আটকে যেত | সব public GET `force-dynamic` / `revalidate = 0` / `Cache-Control: no-store`; `<title>` rAF-এ DB মান দিয়ে re-apply |

## ২) আর্কিটেকচার

```text
Browser (public + admin, কোনো DB driver নেই)
   │  GET  /api/content                 → public, no-store, defaults শুধু DB খালি থাকলে
   │  GET  /api/sections/[section]      → public, no-store
   │  PUT  /api/admin/content          → admin-only batch save (per-section)
   │  PUT/POST/DELETE /api/sections/[section]
   │  POST/DELETE /api/admin/upload    → admin-only, signed Cloudinary
   │  /api/auth/*                      → Better Auth (sign-in / sign-out / get-session)
   ▼
Next.js Route Handlers (nodejs, force-dynamic)
   ├─ requireAdmin() → Better Auth getSession() + ADMIN_EMAIL match
   ├─ src/lib/db.ts        → serverless-cached Mongoose + native MongoClient
   ├─ src/lib/sections.ts  → ২০টি collection: section_<key>
   ├─ src/lib/assets.ts    → portfolio_assets (url + publicId)
   └─ src/lib/auth.ts      → betterAuth + mongodbAdapter, single-admin seed
   ▼
MongoDB Atlas  ·  Cloudinary
```

- **২০টি section collection**: `homepage, personal, socialLinks, heroSocialIds, contactSocialIds, navigation, skillCategories, educationEntries, educationPlaceholder, educationSection, experienceEntries, developmentJourney, achievements, achievementsSection, services, servicesSection, projects, projectsSection, appearance, seo`
- **Database খালি** → `/api/content` `content: null` → site built-in defaults দেখায়।
- **Database-এ ডাটা থাকলে** সবসময় DB-র মান জেতে; default শুধু অনুপস্থিত key fill করে, কখনো override করে না।
- Public site-এ login লাগে না; `/admin` ও সব write API-তে লাগে।

## ৩) Vercel — যা যা Environment Variable দিতে হবে

`Vercel → Project → Settings → Environment Variables` → **Production** (চাইলে Preview-ও) → তারপর **Redeploy** (variable যোগ করলে চলমান deploy-এ পৌঁছায় না)।

| # | Variable | কী / কোথায় পাবেন | Secret? |
| --- | --- | --- | --- |
| 1 | `MONGODB_URI` | MongoDB Atlas → Connect → Drivers → `mongodb+srv://…`; Network Access-এ Vercel IP / `0.0.0.0/0` allow | ✅ |
| 2 | `MONGODB_DB` | ঐচ্ছিক — না দিলে URI-র default DB | ❌ |
| 3 | `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| 4 | `BETTER_AUTH_URL` | `https://your-domain.com` (trailing slash নয়) | ❌ |
| 5 | `NEXT_PUBLIC_APP_URL` | একই public origin | ❌ public |
| 6 | `ADMIN_EMAIL` | আপনার একমাত্র admin ইমেইল | ❌ |
| 7 | `ADMIN_PASSWORD` | কমপক্ষে ৮ অক্ষর | ✅ |
| 8 | `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard | ❌ |
| 9 | `CLOUDINARY_API_KEY` | Cloudinary Dashboard → API Keys | ✅ |
| 10 | `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → API Keys — **কখনো `NEXT_PUBLIC_` নয়** | ✅ |
| 11 | `NEXT_PUBLIC_SITE_URL` | sitemap/canonical/OG-এর জন্য | ❌ public |
| 12 | `RESEND_API_KEY` | https://resend.com/api-keys | ✅ |
| 13 | `CONTACT_TO_EMAIL` | যে ইনবক্সে মেসেজ যাবে | ❌ |
| 14 | `CONTACT_FROM_EMAIL` | Resend-এ **verified** sender domain-এর ঠিকানা | ❌ |

> ⚠️ শুধু `NEXT_PUBLIC_*` গুলো browser-এ যায়। `MONGODB_URI`, `BETTER_AUTH_SECRET`, `ADMIN_PASSWORD`, `CLOUDINARY_API_SECRET` শুধু server-side। `.env.local` `.gitignore`-এ আছে; `.env.example`-এ শুধু খালি নাম আছে, কোনো মান নেই।

### প্রথম admin অ্যাকাউন্ট
কোনো sign-up page নেই (`disableSignUp: true`)। প্রথম request-েই `ADMIN_EMAIL` + `ADMIN_PASSWORD` থেকে **একটিমাত্র** user তৈরি হয় (`ensureAdminUser()`)। তারপর `/login`-এ ইমেইল + পাসওয়ার্ড দিয়ে ঢুকুন। ভুল পাসওয়ার্ড → `401`, public sign-up → `400`।

### পুরনো ডাটা migrate (কিছু হারাবে না)
```bash
# .env.local-এ MONGODB_URI দেওয়ার পর
npm run seed:content                                  # content/portfolio.json থেকে
node scripts/seed-content.mjs --file ./my-export.json
node scripts/seed-content.mjs --dry-run              # শুধু দেখবে, লিখবে না
node scripts/seed-content.mjs --force                # আগের DB section overwrite
```
অথবা `/admin → Overview → Migrate data` বাটন (পুরনো browser `localStorage` ডাটা এক ক্লিকে DB-তে নিয়ে যায়)। DB-তে ডাটা থাকলে স্ক্রিপ্ট `--force` ছাড়া কিছু overwrite করে না।

## ৪) ব্যবহার

1. `/login` → admin ইমেইল + পাসওয়ার্ড
2. যেকোনো tab-এ edit → **Save this section** → `Saved N section(s) to the database.`
3. Save-এর পর UI আবার `/api/content` থেকে DB-র ফেরত ডাটা দেখায়
4. Unsaved change থাকলে browser ছাড়ার আগে warning + header-এ `N unsaved` badge
5. Refresh / browser বন্ধ / নতুন device / redeploy — সব জায়গায় একই MongoDB ডাটা

## ৫) টেস্ট করা হয়েছে (local QA)

| টেস্ট | ফল |
| --- | --- |
| login → change → Save → refresh → ডাটা থাকে | ✅ `QA Persistent Title 2026` reload-এও টিকে |
| Desktop + mobile (375px) একই DB ডাটা | ✅ দুটোতেই `title` ও `h1` মিলেছে |
| login ছাড়া `PUT /api/admin/content`, section PUT, upload | ✅ `401` |
| `/admin` cookie ছাড়া | ✅ `307 → /login?next=/admin` |
| ভুল password / public sign-up | ✅ `401` / `400` |
| Signed Cloudinary upload + url/public_id DB-তে | ✅ (signed request-এ `signature` + `api_key` যাচাই) |
| পুরনো image replace/delete → Cloudinary destroy | ✅ |
| অবৈধ ফাইল টাইপ | ✅ `400` real error |
| Cloudinary config না থাকলে | ✅ `502` real error, **false success নয়** |
| Mouse wheel / touchpad / mobile touch scroll | ✅ `0 → 700 → 940`, mobile `400`, `/admin`-এ `lenis:false` |
| Unsaved change-এ beforeunload warning | ✅ dialog fired, navigation cancel |
| Console/page errors | ✅ `[]` |
| Client bundle-এ secret | ✅ কিছু নেই |
| `npm run lint` · `tsc --noEmit` · `build --webpack` · `audit --omit=dev` | ✅ pass, `0 vulnerabilities` |

> আসল MongoDB Atlas / Cloudinary credential এখানে দেওয়া হয়নি — Vercel-এ আপনি নিজে বসাবেন। Local QA-তে Mongoose cache + Better Auth memory adapter + `content/*.dev.json` fallback ব্যবহার হয়েছে (শুধু `MONGODB_URI` না থাকলে, Vercel-ে কখনো নয়)।

## ৬) নতুন / বদলানো ফাইল

**নতুন:** `src/lib/db.ts`, `src/lib/section-keys.ts`, `src/lib/sections.ts`, `src/lib/assets.ts`, `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/lib/admin-session.ts`, `src/lib/cloudinary.ts`, `src/proxy.ts`, `src/app/api/content/route.ts`, `src/app/api/sections/[section]/route.ts`, `src/app/api/admin/upload/route.ts`, `src/app/api/auth/[...all]/route.ts`, `src/app/login/page.tsx`, `src/components/admin/LoginForm.tsx`, `scripts/seed-content.mjs`, `ADMIN_SETUP.md`

**বদলানো:** `src/components/providers/ContentProvider.tsx`, `src/components/admin/AdminStudio.tsx`, `src/components/admin/fields.tsx`, `src/components/animations/SmoothScroll.tsx`, `src/app/globals.css`, `src/app/api/admin/content/route.ts`, `src/app/api/admin/session/route.ts`, `src/app/api/admin/{login,logout,setup}/route.ts` (legacy shim), `src/components/layout/AppShell.tsx`, `next.config.ts`, `.env.example`, `.gitignore`, `package.json`, `README.md`, `CONTENT_STUDIO.md`, `SETUP.md`, `MAKE_EVERYTHING_WORK.md`

**মুছে ফেলা ফাইল:** কোনোটিই নেই (আপনার নিয়ম মেনে)।
