# Vercel Deployment Guide - Only Text

**Complete guide voor deploying naar Vercel met environment variables**

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Prepare Your Code

✅ **Already Done**:
- Code is committed to GitHub
- `.env.local` is in `.gitignore` (veilig!)
- All pages are production-ready
- No bugs found

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your GitHub

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Find `Only-Text/only-text` repository
4. Click "Import"

### Step 4: Configure Project

**Framework Preset**: Next.js (auto-detected)  
**Root Directory**: `only-text-catalyst`  
**Build Command**: `npm run build` (default)  
**Output Directory**: `.next` (default)  
**Install Command**: `npm install` (default)

---

## 🔐 ENVIRONMENT VARIABLES (CRITICAL!)

### In Vercel Dashboard

**Location**: Project Settings → Environment Variables

Add these **EXACT** variable names:

#### 1. ANTHROPIC_API_KEY
```
Name: ANTHROPIC_API_KEY
Value: [paste your Anthropic API key from .env.local]
Environment: Production, Preview, Development
```

#### 2. OPENAI_API_KEY (optional - for future features)
```
Name: OPENAI_API_KEY
Value: [paste your OpenAI API key from .env.local]
Environment: Production, Preview, Development
```

#### 3. NEXT_PUBLIC_SITE_URL
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://only-text.com
Environment: Production, Preview, Development
```

### ⚠️ IMPORTANT NOTES

**Variable Names**:
- Must be EXACT (case-sensitive)
- `ANTHROPIC_API_KEY` (not `ANTHROPIC_KEY` or `API_KEY`)
- `OPENAI_API_KEY` (not `OPENAI_KEY`)
- `NEXT_PUBLIC_SITE_URL` (must start with `NEXT_PUBLIC_`)

**Environments**:
- ✅ Check ALL three: Production, Preview, Development
- This ensures variables work in all deployments

**Security**:
- ✅ Vercel encrypts all environment variables
- ✅ Never exposed to client-side code
- ✅ Only accessible in API routes (server-side)

---

## 📋 STEP-BY-STEP ENVIRONMENT SETUP

### Visual Guide:

1. **Go to Project Settings**
   - Click your project
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

2. **Add First Variable**
   - Click "Add New"
   - Name: `ANTHROPIC_API_KEY`
   - Value: [paste your Anthropic API key]
   - Check: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

3. **Add Second Variable**
   - Click "Add New" again
   - Name: `OPENAI_API_KEY`
   - Value: [paste your OpenAI API key]
   - Check: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

4. **Add Third Variable**
   - Click "Add New" again
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://only-text.com`
   - Check: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

5. **Verify**
   - You should see 3 variables listed
   - Each should show "Production, Preview, Development"

---

## 🌐 CUSTOM DOMAIN SETUP

### Step 1: Add Domain in Vercel

1. Go to Project Settings → Domains
2. Click "Add"
3. Enter: `only-text.com`
4. Click "Add"

### Step 2: Configure DNS

**If using Vercel DNS** (recommended):
- Vercel will show you nameservers
- Update your domain registrar to use Vercel nameservers
- Wait for DNS propagation (up to 48 hours)

**If using external DNS**:
Add these records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Add www Redirect

1. In Vercel Domains, add `www.only-text.com`
2. Vercel will auto-redirect www → non-www

---

## ✅ DEPLOYMENT CHECKLIST

### Before Deploying
- [x] Code committed to GitHub
- [x] `.env.local` in `.gitignore`
- [x] All pages tested locally
- [x] No console errors
- [x] All imports correct

### During Deployment
- [ ] Project imported to Vercel
- [ ] Root directory set to `only-text-catalyst`
- [ ] Environment variables added (3 variables)
- [ ] All variables checked for all environments
- [ ] Build successful

### After Deployment
- [ ] Visit deployment URL
- [ ] Test homepage
- [ ] Test AI Text Improver
- [ ] Test all tool pages
- [ ] Check console for errors
- [ ] Test on mobile
- [ ] Custom domain configured
- [ ] SSL certificate active (auto)

---

## 🧪 TESTING DEPLOYMENT

### Test URLs

**Vercel Preview**:
- `https://only-text-[random].vercel.app`

**Production** (after domain setup):
- `https://only-text.com`

### Test Checklist

1. **Homepage** (`/`)
   - [ ] Loads without errors
   - [ ] All buttons work
   - [ ] Text processing works
   - [ ] Links to AI tools work

2. **AI Text Improver** (`/ai-text-improver`)
   - [ ] Page loads
   - [ ] Enter text: "this is a test"
   - [ ] Click "Improve Text"
   - [ ] Should get improved version in 1-3 seconds
   - [ ] Toast notification appears
   - [ ] Copy button works

3. **AI Grammar Checker** (`/ai-grammar-checker`)
   - [ ] Page loads
   - [ ] Enter text with errors
   - [ ] Click "Check Grammar"
   - [ ] Should get corrected version
   - [ ] Error status shows

4. **AI Tone Converter** (`/ai-tone-converter`)
   - [ ] Page loads
   - [ ] Select different tone
   - [ ] Enter text
   - [ ] Click "Convert Tone"
   - [ ] Should get converted version

5. **AI Summarizer** (`/ai-summarizer`)
   - [ ] Page loads
   - [ ] Enter long text
   - [ ] Select length
   - [ ] Click "Summarize"
   - [ ] Should get summary
   - [ ] Statistics show

### If AI Features Don't Work

**Check Environment Variables**:
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Verify all 3 variables exist
4. Verify they're enabled for Production
5. If missing, add them and redeploy

**Redeploy**:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait for build to complete
5. Test again

---

## 🔧 TROUBLESHOOTING

### Build Fails

**Error**: "Module not found"
- **Fix**: Check package.json dependencies
- **Action**: Run `npm install` locally, commit, push

**Error**: "Environment variable not found"
- **Fix**: Add missing environment variable in Vercel
- **Action**: Settings → Environment Variables → Add

### AI Features Return 500 Error

**Cause**: Missing or incorrect API key
- **Fix**: Check `ANTHROPIC_API_KEY` in Vercel
- **Action**: Verify exact variable name and value
- **Redeploy**: After fixing

### Domain Not Working

**Cause**: DNS not propagated
- **Fix**: Wait up to 48 hours
- **Check**: Use https://dnschecker.org

**Cause**: Wrong DNS records
- **Fix**: Verify A record points to 76.76.21.21
- **Fix**: Verify CNAME points to cname.vercel-dns.com

---

## 📊 MONITORING

### Vercel Analytics

**Enable**:
1. Project Settings → Analytics
2. Enable Web Analytics
3. View real-time traffic

### Error Tracking

**Check Logs**:
1. Deployments tab
2. Click deployment
3. Click "Functions" tab
4. View API route logs

---

## 🚀 DEPLOYMENT COMMANDS

### Via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd only-text-catalyst
vercel

# Deploy to production
vercel --prod
```

### Environment Variables via CLI

```bash
# Add variable
vercel env add ANTHROPIC_API_KEY

# List variables
vercel env ls

# Pull variables to local
vercel env pull
```

---

## 🎯 POST-DEPLOYMENT

### 1. Submit to Search Engines

**Google Search Console**:
1. Go to https://search.google.com/search-console
2. Add property: `only-text.com`
3. Verify ownership (HTML tag method)
4. Submit sitemap: `https://only-text.com/sitemap.xml`

**Bing Webmaster**:
1. Go to https://www.bing.com/webmasters
2. Add site: `only-text.com`
3. Verify ownership
4. Submit sitemap

### 2. Monitor Performance

**Vercel Analytics**:
- Real-time visitors
- Page views
- Top pages
- Referrers

**Google Analytics** (optional):
- Add GA4 tracking code
- Monitor user behavior
- Track conversions

### 3. Set Up Monitoring

**Uptime Monitoring**:
- Use UptimeRobot (free)
- Monitor `https://only-text.com`
- Get alerts if site goes down

**Error Tracking**:
- Consider Sentry (optional)
- Track JavaScript errors
- Monitor API errors

---

## 💰 COST ESTIMATION

### Vercel Costs

**Hobby Plan** (FREE):
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Serverless functions
- ✅ Custom domains
- ✅ SSL certificates
- ✅ Analytics

**Pro Plan** ($20/month):
- More bandwidth
- Team collaboration
- Priority support

### API Costs

**Anthropic Claude Haiku 4.5**:
- $1 per million input tokens
- $5 per million output tokens

**Estimated Monthly Cost**:
- 1,000 requests/day = ~$3-5/month
- 10,000 requests/day = ~$30-50/month
- Very affordable!

---

## ✅ FINAL CHECKLIST

### Pre-Deployment
- [x] Code on GitHub
- [x] Environment variables documented
- [x] All pages tested locally
- [x] No bugs found

### Deployment
- [ ] Project imported to Vercel
- [ ] Root directory: `only-text-catalyst`
- [ ] 3 environment variables added
- [ ] Build successful
- [ ] Deployment URL works

### Post-Deployment
- [ ] AI features tested and working
- [ ] Custom domain configured
- [ ] SSL active (https)
- [ ] Sitemap submitted to Google
- [ ] Analytics enabled
- [ ] Monitoring set up

---

## 🎉 YOU'RE READY TO DEPLOY!

**Next Steps**:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables
4. Deploy!
5. Test AI features
6. Configure custom domain
7. Submit to search engines

**Estimated Time**: 15-30 minutes

**Result**: World-class AI-powered text tool live on the internet! 🚀

---

**Questions?**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Next.js Docs: https://nextjs.org/docs
