# Only Text - Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd only-text-catalyst
vercel
```

3. **Follow the prompts:**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: only-text
   - Directory: ./
   - Override settings: No

4. **Production Deploy**
```bash
vercel --prod
```

**Custom Domain:**
- Go to Vercel Dashboard → Your Project → Settings → Domains
- Add `only-text.com`
- Follow DNS configuration instructions

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

4. **Configure:**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: (leave empty)

### Option 3: Self-Hosted (VPS/Docker)

#### Using PM2

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Build**
```bash
npm run build
```

3. **Start with PM2**
```bash
pm2 start npm --name "only-text" -- start
pm2 save
pm2 startup
```

#### Using Docker

1. **Create Dockerfile** (already included)
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and Run**
```bash
docker build -t only-text .
docker run -p 3000:3000 only-text
```

---

## 🔧 Environment Variables

Create a `.env.local` file for production:

```env
# Google Analytics (already configured in code)
NEXT_PUBLIC_GA_ID=G-13LZ4LQ68J

# Optional: Custom domain
NEXT_PUBLIC_SITE_URL=https://only-text.com

# Node Environment
NODE_ENV=production
```

---

## 📊 Post-Deployment Checklist

### 1. DNS Configuration
- [ ] Point domain to deployment platform
- [ ] Configure SSL certificate (automatic on Vercel/Netlify)
- [ ] Set up www redirect if needed

### 2. SEO Setup
- [ ] Submit sitemap to Google Search Console
  - URL: `https://only-text.com/sitemap.xml`
- [ ] Submit to Bing Webmaster Tools
- [ ] Verify Google Analytics is working
- [ ] Test structured data with Google Rich Results Test

### 3. Performance Testing
- [ ] Run Lighthouse audit (target: 90+ on all metrics)
- [ ] Test on mobile devices
- [ ] Check Core Web Vitals
- [ ] Test dark mode functionality

### 4. Functionality Testing
- [ ] Test all 5 tool pages
- [ ] Verify paste/copy functionality
- [ ] Test file import/download
- [ ] Check all internal links
- [ ] Verify related tools links work

### 5. Browser Testing
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

---

## 🔍 Google Search Console Setup

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add property: `only-text.com`
   - Verify ownership (HTML tag method)

2. **Submit Sitemap**
   - Sitemaps → Add new sitemap
   - Enter: `sitemap.xml`
   - Submit

3. **Monitor**
   - Check coverage reports
   - Monitor search performance
   - Fix any indexing issues

---

## 📈 Analytics Setup

Google Analytics is already configured with ID: `G-13LZ4LQ68J`

**Verify it's working:**
1. Open browser DevTools → Network tab
2. Visit your site
3. Look for requests to `google-analytics.com/g/collect`

---

## 🔒 Security Headers

Add these headers in your deployment platform:

### Vercel (vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Netlify (netlify.toml)
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 🎯 Performance Optimization

### Image Optimization
- All images should be in WebP format
- Use Next.js Image component for automatic optimization

### Code Splitting
- Already handled by Next.js automatically
- Each page loads only required JavaScript

### Caching
- Static assets cached for 1 year
- HTML pages cached with revalidation

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

For deployment issues:
- Check Next.js deployment docs: https://nextjs.org/docs/deployment
- Vercel support: https://vercel.com/support
- Netlify support: https://www.netlify.com/support/

---

## 🔄 Continuous Deployment

### GitHub Integration (Vercel/Netlify)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/only-text.git
git push -u origin main
```

2. **Connect to Vercel/Netlify**
   - Import project from GitHub
   - Auto-deploy on every push to main branch

### Automatic Deployments
- Push to `main` → Production
- Push to `develop` → Preview
- Pull requests → Preview deployments

---

## ✅ Launch Checklist

- [ ] Domain configured and SSL active
- [ ] All tool pages working
- [ ] Google Analytics tracking
- [ ] Sitemap submitted to search engines
- [ ] Social media cards tested (Open Graph)
- [ ] Mobile responsive verified
- [ ] Dark mode working
- [ ] Performance score 90+
- [ ] All links working
- [ ] Privacy policy accessible
- [ ] Contact information updated

---

**Ready to launch! 🚀**
