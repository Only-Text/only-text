# 🔑 VERCEL ENVIRONMENT VARIABLES - CRITICAL SETUP

**WAAROM AI TOOLS NIET WERKEN**: Environment variables zijn niet ingesteld!

---

## ⚠️ URGENT: Voeg deze toe in Vercel

### Stap 1: Open Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Click op je project: **only-text**
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar

---

### Stap 2: Voeg deze 2 variables toe

#### Variable 1: ANTHROPIC_API_KEY

```
Name: ANTHROPIC_API_KEY
Value: [PASTE JE API KEY HIER - uit .env.local]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Waar vind je de key?**
- Open: `c:\Users\lootj\Documents\text-only\only-text-catalyst\.env.local`
- Copy de waarde na `ANTHROPIC_API_KEY=`
- Paste in Vercel

---

#### Variable 2: OPENAI_API_KEY (optioneel)

```
Name: OPENAI_API_KEY
Value: [PASTE JE API KEY HIER - uit .env.local]
Environments: ✅ Production ✅ Preview ✅ Development
```

---

### Stap 3: Redeploy

**Na het toevoegen**:
1. Go to **Deployments** tab
2. Click **"..."** op de laatste deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## 🧪 TEST NA DEPLOYMENT

**Test deze URLs**:
1. https://only-text.com/ai-text-improver
2. Paste text: "this is a test"
3. Click "Improve Text"
4. Should work in 1-3 seconds! ✅

---

## 📋 CHECKLIST

- [ ] Open Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Add ANTHROPIC_API_KEY (from .env.local)
- [ ] Add OPENAI_API_KEY (from .env.local)
- [ ] Check all 3 environments (Production, Preview, Development)
- [ ] Save
- [ ] Redeploy
- [ ] Test AI tools

---

## 🔍 HOE TE VINDEN: .env.local

**Locatie**: `c:\Users\lootj\Documents\text-only\only-text-catalyst\.env.local`

**Inhoud**:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SITE_URL=https://only-text.com
```

**Copy de keys** en paste in Vercel!

---

## ⚡ WAAROM DIT NODIG IS

**Probleem**:
- `.env.local` is NIET in Git (gitignored)
- Vercel heeft de keys NIET
- AI API calls falen → 500 errors

**Oplossing**:
- Manually add keys in Vercel Dashboard
- Vercel gebruikt ze tijdens build & runtime
- AI tools werken! ✅

---

**ESTIMATED TIME**: 5 minuten

**DO THIS NOW** voordat we de homepage rebuilden! 🚀
