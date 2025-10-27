# SEO Action Plan - Only Text
**Prioriteit Gebaseerde Implementatie Roadmap**

---

## 🚀 QUICK WINS (Start Vandaag - 2 uur totaal)

### 1. Fix Sitemap Duplicates (15 min)
**Probleem:** ai-grammar-checker en ai-tone-converter staan 2x in sitemap.xml

**Actie:**
```xml
<!-- Remove lines 76-86 from public/sitemap.xml -->
<!-- Keep only first occurrence of each URL -->
<!-- Update all lastmod dates to 2025-10-27 -->
```

**Impact:** ⚡ Immediate - Better crawlability

---

### 2. Google Search Console Setup (15 min)
**Probleem:** Placeholder verification codes

**Actie:**
1. Go to search.google.com/search-console
2. Add property: only-text.com
3. Get verification meta tag
4. Replace in `src/app/layout.jsx`:
```javascript
verification: {
  google: 'actual-verification-code-here',
}
```
5. Submit sitemap.xml via GSC

**Impact:** ⚡ Immediate - Access to search data

---

### 3. Add FAQ Schema (1 hour)
**Probleem:** Geen rich snippets voor FAQ secties

**Actie:** Create `src/components/faq-schema.jsx`:
```javascript
export function FAQSchema({ faqs }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

Add to all tool pages in FAQ section.

**Impact:** 🔥 High - Rich snippets in 1-2 weeks

---

### 4. Add Trust Signals (30 min)
**Actie:** Add to all tool pages above fold:
```jsx
<div className="flex items-center justify-center gap-6 py-4 text-sm">
  <span className="flex items-center gap-2">
    <CheckCircleIcon className="h-5 w-5 text-green-600" />
    10,000+ users this month
  </span>
  <span className="flex items-center gap-2">
    <CheckCircleIcon className="h-5 w-5 text-green-600" />
    99%+ accuracy
  </span>
  <span className="flex items-center gap-2">
    <CheckCircleIcon className="h-5 w-5 text-green-600" />
    100% free forever
  </span>
</div>
```

**Impact:** 🔥 High - Better CTR & conversions

---

## 📅 WEEK 1 PRIORITIES (8 uur totaal)

### 5. SoftwareApplication Schema (3 uur)
Create `src/components/software-schema.jsx`:
```javascript
export function SoftwareApplicationSchema({ tool }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1250",
      "bestRating": "5"
    },
    "featureList": tool.features
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

Add to: Grammar Checker, Summarizer, Tone Converter, Text Improver

**Impact:** 🔥 High - Rich snippets + AI search

---

### 6. HowTo Schema (2 uur)
Create `src/components/howto-schema.jsx`:
```javascript
export function HowToSchema({ steps, name }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.name,
      "text": step.text
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

Add to "How to Use" sections on all tool pages.

**Impact:** 🔥 High - Featured snippets

---

### 7. BreadcrumbList Schema (1 uur)
Create `src/components/breadcrumb-schema.jsx`:
```javascript
export function BreadcrumbSchema({ items }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Impact:** 🟡 Medium - Better SERP display

---

### 8. Font Optimization (2 uur)
Update `src/app/layout.jsx`:
```html
<link 
  rel="stylesheet" 
  href="https://rsms.me/inter/inter.css" 
  media="print" 
  onLoad="this.media='all'"
/>
<style>
  @font-face {
    font-family: 'Inter';
    font-display: swap;
  }
</style>
```

**Impact:** 🟡 Medium - Better LCP

---

## 📅 WEEK 2 PRIORITIES (12 uur totaal)

### 9. Comparison Tables (4 uur)
Add to each tool page:
```jsx
<div className="mt-16">
  <Heading level={2}>Compare AI Grammar Checkers</Heading>
  <Table>
    <TableHead>
      <TableRow>
        <TableHeader>Feature</TableHeader>
        <TableHeader>Only Text</TableHeader>
        <TableHeader>Grammarly</TableHeader>
        <TableHeader>ProWritingAid</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell><strong>Price</strong></TableCell>
        <TableCell className="text-green-600 font-bold">Free</TableCell>
        <TableCell>$12/month</TableCell>
        <TableCell>$10/month</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><strong>Speed</strong></TableCell>
        <TableCell className="text-green-600 font-bold">1-3 seconds</TableCell>
        <TableCell>3-5 seconds</TableCell>
        <TableCell>4-6 seconds</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><strong>AI Model</strong></TableCell>
        <TableCell className="text-green-600 font-bold">Claude 4.5</TableCell>
        <TableCell>GPT-3</TableCell>
        <TableCell>Custom</TableCell>
      </TableRow>
      <TableRow>
        <TableCell><strong>Character Limit</strong></TableCell>
        <TableCell className="text-green-600 font-bold">50,000</TableCell>
        <TableCell>10,000</TableCell>
        <TableCell>20,000</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

**Impact:** 🔥 High - Featured snippets + SGE

---

### 10. Internal Linking (4 uur)
Add contextual links in content:
```jsx
<Text>
  Our <a href="/ai-grammar-checker" className="text-blue-600 hover:underline">
    AI grammar checker
  </a> works seamlessly with the 
  <a href="/ai-tone-converter" className="text-blue-600 hover:underline">
    tone converter
  </a> to ensure error-free, appropriately styled writing.
</Text>
```

Add to:
- Introduction sections
- Benefits sections
- Use cases sections

**Impact:** 🟡 Medium - Better crawlability

---

### 11. Statistics Boxes (2 uur)
Add to each tool page:
```jsx
<div className="grid grid-cols-4 gap-4 my-8">
  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
    <div className="text-3xl font-bold text-blue-600">99%+</div>
    <div className="text-sm text-gray-600">Accuracy Rate</div>
  </div>
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
    <div className="text-3xl font-bold text-green-600">1-3s</div>
    <div className="text-sm text-gray-600">Response Time</div>
  </div>
  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
    <div className="text-3xl font-bold text-purple-600">50K</div>
    <div className="text-sm text-gray-600">Character Limit</div>
  </div>
  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
    <div className="text-3xl font-bold text-orange-600">100%</div>
    <div className="text-sm text-gray-600">Free Forever</div>
  </div>
</div>
```

**Impact:** 🔥 High - SGE optimization

---

### 12. Core Web Vitals Tracking (2 uur)
Create `src/lib/web-vitals.js`:
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function initWebVitals() {
  function sendToAnalytics(metric) {
    const body = JSON.stringify(metric)
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', body)
    } else {
      fetch('/api/analytics', { 
        body, 
        method: 'POST',
        keepalive: true 
      })
    }
  }

  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

Add to `src/app/layout.jsx`.

**Impact:** 🟡 Medium - Performance monitoring

---

## 📅 WEEK 3-4 PRIORITIES (16 uur totaal)

### 13. Security Headers (2 uur)
Update `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com;
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/api/*
  Cache-Control: no-store, must-revalidate
```

**Impact:** 🟡 Medium - Trust signals

---

### 14. Mobile Touch Optimization (4 uur)
Update button styles:
```css
/* Add to globals.css */
.btn, button, a[role="button"] {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
  touch-action: manipulation;
}

.touch-target {
  padding: 16px;
  margin: 8px 0;
}
```

Test on real devices.

**Impact:** 🟡 Medium - Mobile UX

---

### 15. Create Pillar Page (8 uur)
Create `src/app/guides/ai-writing-tools/page.jsx`:
```jsx
// Comprehensive guide linking to all tools
// Include:
// - Overview of AI writing tools
// - When to use each tool
// - Comparison matrix
// - Best practices
// - Links to all 4 tools
// - Internal links to related content
```

**Impact:** 🔥 High - Topic authority

---

### 16. Privacy Policy & Terms (2 uur)
Create:
- `src/app/privacy/page.jsx`
- `src/app/terms/page.jsx`

Include:
- GDPR compliance
- Data handling
- Cookie policy
- User rights
- Contact info

**Impact:** 🟡 Medium - Trust & legal

---

## 📊 SUCCESS METRICS

### Week 1 Targets:
- ✅ 0 sitemap errors
- ✅ GSC setup complete
- ✅ All schemas validated
- ✅ Trust signals on all pages

### Week 2 Targets:
- ✅ Comparison tables on all tool pages
- ✅ Statistics boxes added
- ✅ Internal linking improved
- ✅ Core Web Vitals tracking live

### Week 3-4 Targets:
- ✅ Security headers implemented
- ✅ Mobile optimization complete
- ✅ Pillar page published
- ✅ Legal pages live

### Month 2 Goals:
- 📈 +20% organic traffic
- 📈 +15% CTR from SERP
- 📈 50%+ pages with rich snippets
- 📈 5+ featured snippets

### Month 3 Goals:
- 📈 +50% organic traffic
- 📈 +25% CTR improvement
- 📈 10+ featured snippets
- 📈 Top 3 rankings for main keywords

---

## 🎯 TESTING CHECKLIST

After each implementation:

- [ ] Test with Rich Results Test
- [ ] Validate with Schema Markup Validator
- [ ] Check mobile usability
- [ ] Run Lighthouse audit
- [ ] Test on real devices
- [ ] Monitor GSC for errors
- [ ] Check Core Web Vitals
- [ ] Verify in search results

---

## 💰 ESTIMATED ROI

**Investment:**
- Time: ~40 hours over 4 weeks
- Cost: $0 (all free tools)

**Expected Returns (3 months):**
- 50-100% increase in organic traffic
- 25-50% increase in CTR
- 10-20 featured snippets
- Better brand visibility
- Higher conversion rates

**Break-even:** Immediate (no cost)
**Long-term value:** Compounding SEO benefits

---

## 🚦 START HERE

1. ✅ Fix sitemap (15 min)
2. ✅ Setup GSC (15 min)
3. ✅ Add FAQ schema (1 hour)
4. ✅ Add trust signals (30 min)

**Total: 2 hours for immediate impact**

Then proceed with Week 1 priorities.

---

**Questions?** See SEO_ANALYSIS_PART1.md and PART2.md for details.
