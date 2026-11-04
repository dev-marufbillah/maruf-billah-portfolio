# ম্যানুয়াল সেটআপ গাইড — Maruf Billah Portfolio

এই ফাইলে শুধুমাত্র সেই কাজগুলো আছে যেগুলো আপনার নিজস্ব অ্যাকাউন্ট, ডোমেইন বা অনুমোদন ছাড়া করা যায় না। **API key বা password কখনো চ্যাটে পাঠাবেন না**; সরাসরি `.env.local` বা Vercel environment variables-এ রাখুন।

---

## ০. No-code Content Studio (নতুন)

ব্যক্তিগত তথ্য, সোশ্যাল লিংক, resume PDF, skills, education, experience, achievements, services, projects, fonts, logo, theme, animation ও SEO এখন কোড না খুলে `/admin` থেকে এডিট করা যায়। বিস্তারিত গাইড: [`CONTENT_STUDIO.md`](./CONTENT_STUDIO.md)।

Localhost-এ নিজের machine হওয়ায় password ছাড়াই চলে; চাইলে `/admin` থেকে একবার password সেট করে local-কেও lock করা যায়। Arena live preview-এ `/admin` প্রথমবার নিজের password সেট করতে বলবে—এর পর শুধু আপনি edit করতে পারবেন।

Vercel-এ `.env.local` ও Vercel Environment Variables-এ যোগ করুন:

```env
ADMIN_PASSWORD=choose-a-strong-password
ADMIN_SESSION_SECRET=optional-long-random-string
```

এখন Better Auth (MongoDB adapter), MongoDB-তে per-section content, Cloudinary signed upload ও প্রতি-section Save ব্যবহার হয়। ভুল বা পুরনো তথ্য নয় — পূর্ণ Vercel env checklist ও migration: [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)।

---

## ১. যোগাযোগ তথ্য ও সোশ্যাল লিংক

কোনো সার্ভিস অ্যাকাউন্ট লাগবে না।

1. `src/data/personal.ts` খুলুন।
2. `contact` অ্যারেতে আপনার প্রকৃত email, phone ও WhatsApp নম্বর বসান (`null` সরিয়ে string দিন)।
3. `about.fields`-এর আটটি `EDIT:` prompt আপনার নিজের ভাষায় প্রতিস্থাপন করুন এবং `isPlaceholder: false` করুন।
4. `src/data/social.ts`-এ GitHub, LinkedIn, Facebook, Instagram ও X/Twitter-এর প্রকৃত `https://...` URL বসান।
5. `src/data/education.ts`, `src/data/experience.ts`, `src/data/achievements.ts`-এ শুধু যাচাইযোগ্য তথ্য যোগ করুন।
6. `src/data/projects.ts`-এ প্রকৃত screenshots, status, live URL বা repo URL শুধু তখনই দিন যখন সেগুলো সত্যিই কাজ করে।

---

## ২. Resume PDF

কোনো external service লাগবে না।

1. আপনার আসল PDF-এর নাম রাখুন `resume.pdf`।
2. ফাইলটি `public/resume.pdf` পাথে রাখুন।
3. `npm run build` অথবা নতুন deploy চালান।
4. Server-side file check স্বয়ংক্রিয়ভাবে navbar/hero download button ও preview modal active করবে।

PDF না থাকলে বাটন disabled থাকবে এবং preview modal-এ ব্যাখ্যা দেখাবে—এটি ইচ্ছাকৃত, broken link নয়।

---

## ৩. Resend — কন্টাক্ট ফর্মের ইমেইল

### কেন প্রয়োজন
Contact form-এর বার্তা আপনার ইনবক্সে পাঠাতে একটি server-side transactional email service প্রয়োজন। API key শুধু server route-এ ব্যবহৃত হয়; frontend-এ কোনো secret যায় না।

- **Service:** Resend
- **Official site:** https://resend.com
- **Pricing:** https://resend.com/pricing
- **Free tier:** $0/month; বর্তমান official pricing-এ 3,000 emails/month ও 100 emails/day অন্তর্ভুক্ত। Paid plan $20/month থেকে শুরু।
- **Docs:** https://resend.com/docs

### অ্যাকাউন্ট ও API key

1. https://resend.com/signup-এ গিয়ে অ্যাকাউন্ট তৈরি করুন ও ইমেইল verify করুন।
2. Dashboard → **Domains** → **Add Domain**-এ আপনার ডোমেইন যোগ করুন।
3. Resend-এর দেখানো DNS records (SPF/DKIM/সম্পর্কিত records) আপনার DNS provider-এ যোগ করুন।
4. Domain verified হওয়া পর্যন্ত অপেক্ষা করে Dashboard-এ **Verify** চাপুন।
5. Dashboard → **API Keys** → **Create API Key** দিন; sending permission নিশ্চিত করুন।
6. একবার দেখানো `re_...` key টি কপি করুন। চ্যাটে পাঠাবেন না।

### Environment variables

প্রজেক্ট root-এ `.env.local` তৈরি করুন (`.env.example` অনুসরণ করে):

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_your_real_key
CONTACT_TO_EMAIL=your-real-inbox@example.com
CONTACT_FROM_EMAIL=Portfolio <hello@your-verified-domain.com>
```

`CONTACT_FROM_EMAIL` অবশ্যই verified domain-এর ঠিকানা হতে হবে।

> **গুরুত্বপূর্ণ:** Vercel-এ environment variable যোগ/বদল করার পর অবশ্যই **Redeploy** করুন। Vercel variable গুলো build-এ inject করে; আগের চলমান deployment পুরনো মানেই থাকে। Production environment-এ variable গুলো enable আছে কি দেখুন। `GET /api/contact` সার্ভারের লাইভ অবস্থা জানায় (শুধু variable-এর নাম, কোনো secret নয়)। Resend-এর official sender documentation অনুযায়ী, domain verify হলে সেই ডোমেইনের যেকোনো sender address ব্যবহার করা যায়; আলাদা sender identity create করতে হয় না: https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend

### পরীক্ষা

```bash
npm run dev
```

`/#contact`-এ গিয়ে একটি বার্তা পাঠান। API `200 { ok: true }` দিলেই UI success দেখাবে। Credentials missing হলে `503`, Resend reject করলে `502` এবং validation fail হলে `400` দেখাবে।

---

## ৪. GitHub — সোর্স কোড হোস্টিং

### কেন প্রয়োজন
Vercel-এ Git-connected automatic deployment ও source version control-এর জন্য।

- **Service:** GitHub
- **Official site:** https://github.com
- **Pricing:** https://github.com/pricing
- **Free plan:** $0; unlimited public/private repositories, 2,000 CI/CD minutes/month ও 500 MB Packages storage।
- **Status:** এই কনভার্সেশনে GitHub connector উপলভ্য নয়, তাই push ম্যানুয়াল বা আপনার authenticated environment থেকে করতে হবে।

### ধাপ

1. https://github.com/signup-এ অ্যাকাউন্ট তৈরি/লগইন করুন।
2. **New repository** তৈরি করুন, যেমন `maruf-portfolio`। README/LICENSE দিয়ে initialize করবেন না (লোকাল কোড আগেই আছে)।
3. আপনার authenticated terminal-এ:

```bash
cd maruf-portfolio
git init
git add .
git commit -m "Initial premium portfolio implementation"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```

`.env.local` `.gitignore`-এ থাকায় commit হবে না।

---

## ৫. Vercel — Deployment

### কেন প্রয়োজন
Next.js production build, global hosting, automatic HTTPS, preview deployments এবং environment variables-এর জন্য।

- **Service:** Vercel
- **Official site:** https://vercel.com
- **Pricing/plans:** https://vercel.com/docs/plans
- **Free Hobby plan:** personal projects, Git integration, CI/CD, automatic HTTPS/SSL ও preview deployments অন্তর্ভুক্ত।
- **Deployment docs:** https://vercel.com/docs/deployments
- **Status:** এই কনভার্সেশনে Vercel connector disconnected; আপনাকে dashboard-এ connect/authorize করতে হবে।

### ধাপ

1. https://vercel.com/signup-এ GitHub দিয়ে sign up/login করুন।
2. Dashboard → **Add New… → Project** → আপনার `maruf-portfolio` repository import করুন।
3. Framework স্বয়ংক্রিয়ভাবে **Next.js** detect হবে; Root Directory `maruf-portfolio` হলে সেটি নির্বাচন করুন, অন্যথায় repository root-ই রাখুন।
4. **Environment Variables**-এ নিচেরগুলো যোগ করুন:

```text
NEXT_PUBLIC_SITE_URL=https://<YOUR-VERCEL-DOMAIN>
RESEND_API_KEY=re_your_real_key
CONTACT_TO_EMAIL=your-real-inbox@example.com
CONTACT_FROM_EMAIL=Portfolio <hello@your-verified-domain.com>
```

5. **Deploy** চাপুন।
6. Deploy সফল হওয়ার পর Vercel-এর দেওয়া production URL কপি করুন।
7. `NEXT_PUBLIC_SITE_URL` সেই প্রকৃত URL-এ update করে আবার deploy করুন, যাতে canonical URL, sitemap ও structured data সঠিক হয়।
8. Live site-এ homepage, তিনটি project detail page, `/sitemap.xml`, `/robots.txt`, mobile navigation ও contact form পরীক্ষা করুন।

`NEXT_PUBLIC_SITE_URL` production-এ set না করলে canonical/sitemap localhost-কেই নির্দেশ করবে—এটি ইচ্ছাকৃত fallback, কোনো ভুয়া live domain নয়।

---

## ৬. Deploy-এর পরে যাচাই করার চেকলিস্ট

- [ ] সব social/contact links কাজ করে
- [ ] Resume download/preview আসল PDF খোলে
- [ ] Contact form প্রকৃত ইনবক্সে ইমেইল পাঠায়
- [ ] Success notification শুধু API `200 ok: true`-এর পরেই দেখা যায়
- [ ] `/projects/niketan-mart`, `/projects/ai-omnichannel-inbox`, `/projects/windows-ai-voice-agent` খোলে
- [ ] Previous/next ও back-to-projects links কাজ করে
- [ ] 320px, 375px, 425px, 768px, 1024px, 1440px, 1920px-এ horizontal overflow নেই
- [ ] Lighthouse/PageSpeed-এ accessibility, SEO ও performance যাচাই
- [ ] Google Rich Results Test-এ Person/WebSite JSON-LD যাচাই

---

## আপনার কাছ থেকে প্রয়োজনীয় ইনপুট

১. প্রকৃত email, phone, WhatsApp ও social profile URLs  
২. About-এর আটটি ব্যক্তিগত তথ্য  
৩. Education, professional experience বা development journey, achievements  
৪. আসল `resume.pdf`  
৫. প্রকৃত project screenshots/status/live/repo URLs  
৬. Resend, GitHub ও Vercel অ্যাকাউন্ট setup সম্পন্ন হওয়ার নিশ্চয়তা (secret নয়)

এই ম্যানুয়াল ধাপগুলো সম্পন্ন না হওয়া পর্যন্ত সংশ্লিষ্ট ফিচারগুলো স্পষ্ট placeholder/disabled অবস্থায় থাকবে; বাকি ওয়েবসাইট সম্পূর্ণ কার্যকর থাকবে।
