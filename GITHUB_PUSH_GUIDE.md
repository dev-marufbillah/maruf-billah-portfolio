# GitHub-এ পুরো প্রজেক্ট push — পূর্ণ গাইড (Step 2 পরের সংস্করণ)

> **এক লাইনে:** আপনি নিজে push করবেন। আমি commit করেছি (`6845277`), কিন্তু **push করিনি** — আপনি বলেছিলেন নিজের হাতে করবেন। Arena-তে GitHub connector নেই (`unsupported`), তাই আমি আপনার হয়ে push-ও করতে পারব না; আপনার অ্যাকাউন্ট/টোকেন আমি চাইব না, চ্যাটে পাঠাবেনও না।

## বর্তমান অবস্থা (যাচাই করা)

| জিনিস | মান |
| --- | --- |
| Workspace | `/home/user/maruf-portfolio` |
| Branch | **`fix/admin-mongodb-sync`** (সাথে আগের `master`-ও আছে) |
| Commit | **১২টি**, সর্বশেষ `6845277 Step 2: MongoDB + Better Auth + Cloudinary…` |
| Remote | **কোনোটিই নেই** → প্রথমবার `git remote add origin …` লাগবে |
| Working tree | clean |
| সোর্স ZIP | `/home/user/maruf-portfolio-source.zip` (৭৫৭K, ১৫৬ ফাইল, **`.git` নেই**) |
| Secret | `.env.local`, `content/admin-auth.json`, `content/*.dev.json`, `node_modules`, `.next` — সব `.gitignore`-এ; ZIP-ও বাদ দেওয়া হয়েছে। শুধু `.env.example` (খালি টেমপ্লেট) tracked |

> ⚠️ **Push-এর জন্য MongoDB / Cloudinary / Resend / Vercel-এর কোনো key লাগবে না।** সেগুলো শুধু Vercel Environment Variables-এ বসান ([`ADMIN_SETUP.md`](./ADMIN_SETUP.md))। কোডের সাথে কোনো secret যাবে না।

---

## কোন পথ বেছে নেবেন?

| পথ | কখন | ইতিহাস |
| --- | --- | --- |
| **A — নিজের পিসিতে ZIP extract করে push (সুপারিশ)** | আপনি Windows/VS Code-এ কাজ করেন, সবচেয়ে সহজ | নতুন `Initial commit` (১টি) |
| **B — Arena workspace থেকে push** | ১২টি commit-এর পুরো history রাখতে চান | ১২টি commit আছে |

> ZIP-এ `.git` ফোল্ডার নেই (ইচ্ছাকৃত) — তাই **A পথে `git init` বাধ্যতামূলক**। B পথে আগে থেকেই `.git` আছে, শুধু remote যোগ করলেই হয়।

---

# পথ A — নিজের পিসি (Windows / PowerShell) ⭐

## ধাপ ১: ফাইল ready করুন

1. `/home/user/maruf-portfolio-source.zip` ডাউনলোড করুন
2. Extract করুন → ভেতরে **`maruf-portfolio/`** ফোল্ডার পাবেন (নesting ঠিক আছে)
3. VS Code দিয়ে ফোল্ডারটা খুলুন: [`OPEN_IN_VSCODE.md`](./OPEN_IN_VSCODE.md)
4. PowerShell-এ:
   ```powershell
   cd maruf-portfolio
   git --version
   ```
   `git version 2.x` না দেখালে → https://git-scm.com/download/win থেকে ইনস্টল করুন (**Git Credential Manager** সিলেক্টেড রাখুন)।

## ধাপ ২: GitHub-এ খালি repo বানান

যান 👉 **https://github.com/new**

| ফিল্ড | মান |
| --- | --- |
| Owner | আপনার username |
| Repository name | `maruf-portfolio` |
| Visibility | Public বা Private |
| **README / .gitignore / license** | ❌ **কোনোটিই টিক দেবেন না** (নাহলে push-এ conflict হয়) |

**Create repository** → পরের পেজ থেকে **HTTPS URL** কপি করুন:
```
https://github.com/YOUR-USERNAME/maruf-portfolio.git
```

## ধাপ ৩: Authentication (একবার)

GitHub-এ **অ্যাকাউন্ট password দিয়ে আর push হয় না**। যেকোনো একটি:

**সহজ:** Git for Windows-এর GCM — প্রথম `git push`-এ browser খুলবে → GitHub-এ login → Authorize → শেষ।

**PAT চাইলে:** https://github.com/settings/personal-access-tokens → **Fine-grained tokens → Generate new token**
- Token name: `maruf-portfolio-push`, Expiration: ৩০/৯০ দিন
- Resource owner: নিজের অ্যাকাউন্ট → **Only select repositories** → `maruf-portfolio`
- Permissions → **Contents: `Read and Write`**
- **Generate** → `github_pat_…` একবারই দেখা যায়, কপি করুন
- `git push`-এ username = আপনার GitHub username, **password = এই token** (অ্যাকাউন্ট password নয়)

> টোকেন কখনো চ্যাটে, `.env`-এ বা repo-তে রাখবেন না।

## ধাপ ৪: কমান্ড (কপি-পেস্ট)

```powershell
cd maruf-portfolio

git init -b main
git config user.name "আপনার নাম"
git config user.email "আপনার-GitHub-ইমেইল"

git add .
git commit -m "Initial commit — luxury light portfolio with MongoDB admin"

git remote add origin https://github.com/YOUR-USERNAME/maruf-portfolio.git
git remote -v

git push -u origin main
```

`YOUR-USERNAME` বদলান। সফল হলে:
```
Enumerating objects: … done.
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

> ⚠️ PowerShell-এ `https://github.com/...` বা `http://localhost:3000` **কমান্ড হিসেবে টাইপ করবেন না** — সেটা URL, ব্রাউজারে paste করুন বা `Start-Process "https://github.com/YOUR-USERNAME/maruf-portfolio"`।

## ধাপ ৫: যাচাই

`https://github.com/YOUR-USERNAME/maruf-portfolio` খুলে দেখুন:
- ✅ `README.md`, `ADMIN_SETUP.md`, `package.json`, `src/`, `public/`, `scripts/seed-content.mjs`, `.env.example`
- ✅ `src/app/api/content/`, `src/app/api/auth/`, `src/proxy.ts`, `src/app/login/`
- ❌ `.env.local`, `content/admin-auth.json`, `node_modules/`, `.next/`, `content/*.dev.json` — **কোনোটিই নেই**

Local-এও চেক:
```powershell
git status
git ls-files | Select-String -Pattern "\.env|admin-auth|sections.dev|assets.dev"
# শুধু .env.example আসা উচিত
```

---

# পথ B — Arena workspace থেকে (১২টি commit সহ)

এখানে আগে থেকেই `.git` আছে, ১২টি commit আছে, শুধু remote নেই।

```bash
cd /home/user/maruf-portfolio

# অপশন ১: branch-টি যেমন আছে তেমনি push (GitHub-এ পরে merge/PR করা যাবে)
git remote add origin https://github.com/YOUR-USERNAME/maruf-portfolio.git
git push -u origin fix/admin-mongodb-sync

# অপশন ২: main বানিয়ে push (সরাসরি default branch)
git branch -M main
git push -u origin main

# master-ও পাঠাতে চাইলে
git push origin master
```

> এখানে authenticate করতে হবে আপনাকেই (GCM/PAT/SSH)। আমি আপনার token চাইছি না — চাইলে নিজের টার্মিনালে বসিয়ে কমান্ডগুলো চালিয়ে নিন।

---

## এরপর Vercel (push-এর পরেই)

1. https://vercel.com/new → **Import Git Repository** → `maruf-portfolio` → **Deploy**
2. Project → Settings → **Environment Variables**-এ [`ADMIN_SETUP.md`](./ADMIN_SETUP.md)-র ১৪টি variable বসান (Production + Preview) → **Redeploy**
   - `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (+ ঐচ্ছিক `MONGODB_DB`)
3. Deploy হলে `https://your-domain/login` → `ADMIN_EMAIL` / `ADMIN_PASSWORD` দিয়ে ঢুকে `/admin → Overview → Migrate data` (পুরনো ডাটা থাকলে), তারপর প্রতি section-এ **Save**।
4. এরপর থেকে `git push` করলেই Vercel **auto-redeploy** হয়।

> মনে রাখবেন: variable যোগ/বদল করলে **অবশ্যই Redeploy** — চলমান deployment পুরনো env-ই রাখে।

---

## সমস্যা → সমাধান

| Error | কারণ | সমাধান |
| --- | --- | --- |
| `fatal: remote origin already exists` | আগে remote ছিল | `git remote set-url origin https://github.com/USER/REPO.git` |
| `Authentication failed` / `403` | অ্যাকাউন্ট password বা ভুল/মেয়াদোঠা token | GCM browser login, বা নতুন fine-grained PAT (`Contents: Read and Write`); Windows → Control Panel → Credential Manager → পুরনো GitHub entry মুছে আবার push |
| `src refspec main does not match any` | commit হয়নি / branch নাম ভুল | `git add . && git commit -m "…"` → `git branch -M main` → push |
| `failed to push some refs` | repo-তে README টিক দিয়েছিলেন | repo মুছে **খালি** করে আবার বানান; অথবা `git pull origin main --allow-unrelated-histories` → তারপর push |
| `repository not found` | username/repo ভুল বা token-এ access নেই | URL মিলিয়ে নিন; PAT-এ সঠিক repo সিলেক্ট আছে কি দেখুন |
| `Permission denied (publickey)` | SSH key যোগ হয়নি | https://github.com/settings/keys → public key যোগ, বা HTTPS+GCM ব্যবহার করুন |
| `@next/swc-win32-x64-msvc` / Turbopack error | Windows native binding | `powershell -ExecutionPolicy Bypass -File .\fix-windows.ps1` — ডিফল্ট `dev`/`build` আগেই `--webpack` |
| `cd maruf-portfolio` কাজ করে না | ZIP extract করেননি / ভুল ফোল্ডার | ZIP extract → ভেতরের `maruf-portfolio/`-এ ঢুকুন |
| `http://localhost:3000` কমান্ড নয় | URL টাইপ করা | ব্রাউজারে খুলুন বা `Start-Process "http://localhost:3000"` |

---

## ভবিষ্যতে আপডেট পাঠানো

```powershell
cd maruf-portfolio
git status
git add .
git commit -m "Update hero copy"
git push
```

---

## নিরাপত্তা চেকলিস্ট

- ✅ `.env*` `.gitignore`-এ; শুধু **`.env.example`** tracked (ভেতরে কোনো মান নেই)
- ✅ `content/admin-auth.json`, `content/sections.dev.json`, `content/assets.dev.json` ignored + ZIP-থেকে বাদ
- ✅ `node_modules/`, `.next/`, `*.tsbuildinfo`, logs — সব বাদ
- ✅ `CLOUDINARY_API_SECRET`, `MONGODB_URI`, `BETTER_AUTH_SECRET`, `ADMIN_PASSWORD` শুধু server-side env; client bundle-এ নেই
- ✅ টোকেন/পাসওয়ার্ড কখনো চ্যাটে, কোডে বা remote URL-এ (`https://TOKEN@github.com/...`) নয়
- ✅ টোকেন leaked হলে → https://github.com/settings/personal-access-tokens → **Delete** → নতুন token

---

**সংক্ষেপে:** ZIP → extract → `git init -b main` → `git add .` → `git commit` → GitHub-এ খালি repo → `git remote add origin …` → `git push -u origin main` → Vercel import + env + Redeploy। কোনো API key push-এ লাগে না, কোনো secret যাবে না।

সম্পর্কিত: [`ADMIN_SETUP.md`](./ADMIN_SETUP.md) · [`SETUP.md`](./SETUP.md) · [`OPEN_IN_VSCODE.md`](./OPEN_IN_VSCODE.md) · [`MAKE_EVERYTHING_WORK.md`](./MAKE_EVERYTHING_WORK.md)
