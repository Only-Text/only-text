# Only Text - SEO & Product Improvement Plan

## 📊 Concurrentieanalyse

### Top Performers
- **Editpad/OnlineTextEditor**: Brede bundel teksttools met sterke interne linking
- **WordCounter**: Sterke focus op word counter + subtools met FAQ
- **ConvertCase**: Doelgerichte pagina's per bewerking met live preview
- **TextFixer**: Jaren lang ranking met één probleem, één pagina
- **Diffchecker**: Single-purpose UX met shareable resultaten
- **Hemingway/LanguageTool**: Kwaliteitslaag met leesbaarheid en grammatica

### Winnende Strategie
✅ 1 probleem = 1 supersnelle toolpagina  
✅ Veel varianten binnen dezelfde topiccluster  
✅ Lichte "intelligence" voor autoriteit

---

## 🎯 Positionering Only Text

**Focus**: "De snelste suite voor plain-text bewerken en opschonen"

**Kernwaarden**:
- Direct en snel
- Privacy-vriendelijk
- Geen login/tracking
- Offline-modus waar mogelijk

---

## 🛠️ Feature-set per Laag

### Laag 1: Opschonen
- ✅ Verwijder emojis
- ✅ Verwijder bullets
- ✅ Verwijder speciale tekens
- ⏳ Dubbele spaties verwijderen
- ⏳ Smart quotes → straight quotes
- ⏳ HTML-tags strippen
- ⏳ Diakritische tekens verwijderen
- ⏳ Line-breaks fix
- ⏳ Spaties/whitespace trim
- ⏳ Dedupe/sort lines
- ⏳ Find-replace

### Laag 2: Bewerken
- ⏳ Case converter
- ⏳ Word/character/sentence/paragraph counter
- ⏳ Reflow/word-wrap
- ⏳ Slugify
- ⏳ URL encode/decode

### Laag 3: Lichte AI
- ✅ AI Clean (detecteert rommel)
- ⏳ AI Rewrite/Summarize
- ⏳ Grammar check (LanguageTool)

### Laag 4: Vergelijk/Controle
- ⏳ Inline diff (tekst A/B)

---

## 📁 SEO-Architectuur

### Homepage (/)
- Hero: "Maak je tekst in 1 klik schoon"
- CTA's naar top tools
- Blokken: Schoonmaken, Bewerken, Slimme hulp, Privacy
- Interne links naar top 8 tools

### Tool Hub (/text-cleaner)
- Centrale hub voor alle schoonmaaktools
- Tabs/checkboxes voor verschillende bewerkingen
- Micro-FAQ en "Hoe werkt het"

### Tool Landing Pages (Prioriteit)
1. ⏳ `/remove-emojis`
2. ⏳ `/remove-bullet-points`
3. ⏳ `/remove-special-characters`
4. ⏳ `/remove-line-breaks`
5. ⏳ `/strip-html`
6. ⏳ `/remove-extra-spaces`
7. ⏳ `/straighten-quotes`
8. ⏳ `/dedupe-lines`
9. ⏳ `/sort-lines`
10. ⏳ `/find-and-replace`
11. ⏳ `/word-counter`
12. ⏳ `/character-counter`
13. ⏳ `/case-converter`
14. ⏳ `/slugify`
15. ⏳ `/url-encoder`
16. ⏳ `/url-decoder`
17. ⏳ `/reflow-text`

### Slimme Laag
- ⏳ `/ai-clean`
- ⏳ `/grammar-check`
- ⏳ `/readability`
- ⏳ `/rewrite`
- ⏳ `/summarize`

### Kennis & Vergelijk
- ⏳ `/what-is-plain-text`
- ⏳ `/how-to-clean-ai-generated-text`
- ⏳ `/remove-formatting-from-word-google-docs`
- ⏳ `/compare-tools/only-text-vs-convert-case`
- ⏳ `/privacy`
- ⏳ `/changelog`

---

## 📝 Content Template per Tool

```markdown
# [Tool Name] - H1 met exact keyword

## Intro (2-3 zinnen met primaire use-case)

## Tool UI

## How it Works (3-5 bullets)

## Examples (2 input → output blokken)

## FAQ (4-6 Q&A's met semantische varianten)

## Related Tools (6 interne links)

## Privacy Block

## Schema: FAQPage + SoftwareApplication
```

---

## 🚀 4-Weken Roadmap

### Week 1: Foundation
- [ ] Information architecture definitief
- [ ] Basislayout en componenten
- [ ] Telemetry setup
- [ ] Tools v1: text-cleaner, remove-emojis, remove-bullets, remove-special-characters, remove-line-breaks
- [ ] Page template + schema + i18n basis

### Week 2: Core Tools
- [ ] Tools v2: word/character counter, case converter, strip-html, remove-extra-spaces, straighten-quotes
- [ ] Interne linking logica
- [ ] Content: 10 tool-pagina's met voorbeelden + FAQ

### Week 3: Smart Layer
- [ ] AI Clean
- [ ] Readability
- [ ] Grammar (LanguageTool koppeling)
- [ ] Diff-viewer lokaal
- [ ] Programmatic SEO: 20 variantenpagina's

### Week 4: Polish & Launch
- [ ] i18n EN/NL afronden
- [ ] Hreflang implementatie
- [ ] Core Web Vitals hardening
- [ ] Schema QA
- [ ] Sitemap automation
- [ ] Outreach content

---

## 📊 SEO-Maatregelen

### On-Page
- [ ] Keyword-dekking: 1 hoofdkeyword per toolpagina
- [ ] Interne links: "Gerelateerde tools" onderaan elke pagina
- [ ] Schema.org: SoftwareApplication + FAQPage per tool
- [ ] HowTo schema waar relevant

### Technical
- [ ] 100 Lighthouse mobiel score
- [ ] i18n: NL en EN met hreflang
- [ ] Sitemaps: split per type, dagelijkse refresh
- [ ] Canonical tags op toolvarianten
- [ ] SERP-hooks: copy button, shareable permalinks

### Content
- [ ] Programmatic SEO met echte voorbeelden
- [ ] Geen thin content
- [ ] Micro-FAQ per pagina

---

## 🎨 UX-Ontwerp Principes

### Above-the-fold
- Grote tekstarea
- Result area rechts of onder
- 1 primaire actieknop

### Features
- Live resultaten bij typen
- Sticky utility bar: copy, download, clear, undo, paste
- "Alles client-side" privacy label
- Voorbeeldchips "Voorbeeld laden"
- Toetsenbordshortcuts
- Hoge contrastmodus
- No-ads (max 1 sponsor in footer)

---

## 💻 Technische Stack

### Core
- Next.js met edge-SSR
- Alle bewerkingen client-side in TypeScript
- Zero-JS op info-pagina's
- URL-hash met instellingen (shareable)

### AI & Services
- Server-side API route met usage cap
- Self-hosted LanguageTool of betaalde API
- Privacy-vriendelijke analytics

### Libraries
- Grapheme-splitting voor veilige tellers
- Heuristiek voor bullet-detectie
- Diff-lib (Myers) voor lokale compare

### QA
- Unit-tests per transformatie
- Snapshot-tests voor edge-cases
- Emoji surrogate pairs
- RTL-scripts
- Combinerende accenten

---

## 📈 KPI's

### 30 Dagen
- 30 tool-URL's geïndexeerd
- >3 min dwell op top 5 tools

### 60 Dagen
- Top 10 voor "remove emojis from text"
- Top 10 voor "remove line breaks"
- Top 10 voor "case converter"

### 90 Dagen
- 100 tool/variant-URL's live
- >50 interne links per cluster
- CR >25% op "copy result"

---

## 🎯 Differentiatie

| Aspect | Only Text | Concurrenten |
|--------|-----------|--------------|
| Snelheid | ⚡ Superfast | Editpad: zware bundel |
| Diepte | 🔧 Complete suite + AI | ConvertCase: basis |
| Privacy | 🔒 Client-side | Grammarly: tracking |
| Sharing | 🔗 URL-hash | Diffchecker: upload |

---

## ✅ Directe To-Do's (Prioriteit)

### Fase 1: Huidige Site Verbeteren
- [ ] 1.1 Homepage optimaliseren met duidelijke value proposition
- [ ] 1.2 Huidige tools stabiliseren en testen
- [ ] 1.3 Privacy policy pagina toevoegen
- [ ] 1.4 Robots.txt en sitemap.xml optimaliseren

### Fase 2: Core Infrastructure
- [ ] 2.1 Next.js project opzetten
- [ ] 2.2 Component library bouwen
- [ ] 2.3 Routing structuur implementeren
- [ ] 2.4 i18n framework (NL/EN)

### Fase 3: Tool Development
- [ ] 3.1 TextArea + Result component met live pipeline
- [ ] 3.2 5 schoonmaakfuncties met unit-tests
- [ ] 3.3 Word/character counter
- [ ] 3.4 Case converter
- [ ] 3.5 Line breaks remover

### Fase 4: Content & SEO
- [ ] 4.1 Template content voor 10 tool-pagina's
- [ ] 4.2 FAQ + schema per pagina
- [ ] 4.3 Hreflang implementatie
- [ ] 4.4 Sitemap automation

### Fase 5: Advanced Features
- [ ] 5.1 LanguageTool koppeling
- [ ] 5.2 AI Clean functionaliteit
- [ ] 5.3 Diff viewer
- [ ] 5.4 Shareable URL-hash

### Fase 6: Performance & Launch
- [ ] 6.1 Core Web Vitals optimalisatie (100 mobiel)
- [ ] 6.2 Schema.org QA
- [ ] 6.3 Analytics setup
- [ ] 6.4 Outreach content

---

## 📅 Huidige Status

**Datum**: 24 oktober 2025  
**Fase**: Catalyst UI Implementatie  
**Volgende Stap**: Dedicated tool pages maken

### ✅ Voltooide Taken (Catalyst UI)

**Fase 1: Foundation (Voltooid)**
- ✅ Homepage geoptimaliseerd met SEO
- ✅ Privacy policy pagina aangemaakt
- ✅ Robots.txt en sitemap.xml geoptimaliseerd
- ✅ Structured data toegevoegd

**Fase 2: Real-time Statistieken (Voltooid)**
- ✅ Character, word, line, sentence counter
- ✅ Live updates bij tekstwijzigingen

**Fase 3: Catalyst UI Migration (IN PROGRESS)**
- ✅ Next.js project opgezet met Catalyst UI Kit
- ✅ Alle Catalyst componenten gekopieerd
- ✅ Homepage gebouwd met Catalyst UI componenten:
  - Button component voor acties
  - Textarea component voor tekst input
  - Heading component voor titels
  - Responsive grid layouts
  - Dark mode support
- ✅ Tool functionaliteit gemigreerd naar React
- ✅ Real-time statistieken geïmplementeerd
- ✅ Toggle buttons voor features
- ✅ Development server draait op http://localhost:3000

### 🎨 Catalyst UI Componenten in Gebruik
- `Button` - Voor alle actieknoppen (Paste, Copy, Download, Clear, Toggles)
- `Textarea` - Voor de hoofdtekst input
- `Heading` - Voor section headers
- Tailwind CSS v4 - Voor alle styling
- Dark mode - Automatisch ondersteund

### 📂 Project Structuur
```
only-text-catalyst/
├── src/
│   ├── app/
│   │   ├── layout.jsx (Root layout met metadata)
│   │   └── page.jsx (Homepage met tool)
│   ├── components/ (Alle Catalyst UI componenten)
│   └── styles/
│       └── tailwind.css
├── package.json
└── next.config.mjs
```

---

*Dit plan wordt systematisch afgewerkt met controle na elke stap.*
