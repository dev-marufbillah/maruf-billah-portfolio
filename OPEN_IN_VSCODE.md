# VS Code-এ প্রজেক্ট ওপেন করার গাইড

## গুরুত্বপূর্ণ আপডেট

নতুন **`maruf-portfolio-source.zip`**-এর ভেতরে এখন একটি top-level `maruf-portfolio/` ফোল্ডার আছে। আগের পুরনো extract করা ফোল্ডারটি প্রথমে ডিলিট করে নতুন ZIP আবার extract করুন।

Default `npm run dev` ও `npm run build` এখন **Webpack** ব্যবহার করে, কারণ কিছু Windows x64 setup-এ Next.js 16-এর Turbopack native binding কাজ করে না। Turbopack চাইলে `npm run dev:turbo` ব্যবহার করা যায়, কিন্তু Windows-এ Webpack-ই recommended।

---

## সবচেয়ে সহজ উপায় — নতুন ZIP থেকে

1. পুরনো `maruf-portfolio-source` ফোল্ডারটি ডিলিট করুন।
2. Workspace-এর নতুন **`maruf-portfolio-source.zip`** ডাউনলোড করুন।
3. `Downloads`-এ extract করুন। এরপর পাবেন:

```text
Downloads\
  maruf-portfolio-source\
    maruf-portfolio\
      package.json
      src\
      public\
      README.md
      OPEN_IN_VSCODE.md
      fix-windows.ps1
```

4. PowerShell-এ যান:

```powershell
cd "C:\Users\MARUF SALAUDDIN\Downloads\maruf-portfolio-source\maruf-portfolio"
```

5. VS Code দিয়ে পুরো ফোল্ডার ওপেন করুন:

```powershell
code .
```

অথবা VS Code → **File → Open Folder…** → উপরের `maruf-portfolio` ফোল্ডার সিলেক্ট করুন।

> যে ফোল্ডারে `package.json` আছে, সেটিই root। শুধু `src/` বা `page.tsx` ওপেন করবেন না।

---

## Windows-এ one-click fix

PowerShell-এ প্রজেক্ট root-এ গিয়ে:

```powershell
powershell -ExecutionPolicy Bypass -File .\fix-windows.ps1
```

এই script স্বয়ংক্রিয়ভাবে:

- `node_modules`, `.next` ও old TypeScript cache মুছে দেবে
- npm cache verify করবে
- `npm install` চালাবে
- `npm run dev` Webpack mode-এ চালু করবে

### ম্যানুয়ালি করতে চাইলে

```powershell
cd "C:\Users\MARUF SALAUDDIN\Downloads\maruf-portfolio-source\maruf-portfolio"
Remove-Item -Recurse -Force node_modules, .next, tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
npm cache verify
npm install
npm run dev
```

যদি native-binding error আবারও আসে, তখন:

```powershell
npm cache clean --force
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
npm install
npm run dev
```

---

## Browser খোলা

PowerShell-এ URL টাইপ করবেন না। `http://localhost:3000` কোনো command নয়।

Browser-এ সরাসরি লিখুন:

```text
http://localhost:3000
```

অথবা PowerShell থেকে:

```powershell
Start-Process "http://localhost:3000"
```

Server বন্ধ করতে VS Code terminal-এ `Ctrl+C` চাপুন।

### কোড না ছুঁয়ে content এডিট

Server চালু থাকলে `http://localhost:3000/admin` খুলুন। সব তথ্য, লিংক, resume, skills, projects, fonts ও theme সেখান থেকে এডিট করা যায়। নিজের কম্পিউটারে password ছাড়াই চলে; live preview বা deploy-এ প্রথমবার password সেট করলে শুধু আপনি edit করতে পারবেন। বিস্তারিত: `CONTENT_STUDIO.md`।

---

## npm warnings সম্পর্কে

`npm install`-এ `eslint@9 deprecated` এবং `16 moderate severity vulnerabilities` দেখা যেতে পারে। এগুলো development dependency-র warning; production dependency audit clean:

```powershell
npm audit --omit=dev
```

`npm audit fix --force` চালাবেন না—এটি Next.js/ESLint-এর major version বদলে প্রজেক্ট ভেঙে দিতে পারে।

---

## অন্য প্ল্যাটফর্ম

### macOS / Linux

```bash
cd ~/Downloads/maruf-portfolio-source/maruf-portfolio
code .
npm install
npm run dev
```

### এই Arena sandbox-এ সরাসরি

```bash
cd /home/user/maruf-portfolio
npm install
npm run dev
```

Arena-র লাইভ প্রিভিউ আগে থেকেই চলছে; লোকাল VS Code-এর পরিবর্তন স্বয়ংক্রিয়ভাবে সেখানে sync হবে না।

---

## কোথায় কী পাবেন

| ফোল্ডার/ফাইল | কাজ |
| --- | --- |
| `src/data/` | নাম, যোগাযোগ, social, skills, education, experience, projects, services |
| `src/components/sections/` | Homepage-এর প্রতিটি section |
| `src/app/projects/[slug]/page.tsx` | Dynamic project detail route |
| `src/app/api/contact/route.ts` | Contact form server API |
| `public/images/` | আপনার আসল ছবি |
| `public/projects/` | Replaceable concept-preview covers |
| `SETUP.md` | Resend, GitHub ও Vercel setup |
| `README.md` | প্রজেক্ট overview ও checklist |
| `fix-windows.ps1` | Windows clean-install + dev server script |

## Recommended VS Code extensions

- ESLint
- Tailwind CSS IntelliSense
- Prettier – Code formatter
- Error Lens (optional)
