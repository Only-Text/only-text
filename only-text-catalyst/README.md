# Catalyst Demo

Built with **Catalyst UI Kit**, **Next.js 15**, and **Tailwind CSS v4**.

## 🚀 Features

- **Real-time Text Processing** - All processing happens client-side for maximum privacy
- **Multiple Tools** - Dedicated pages for specific text operations
- **Beautiful UI** - Modern, responsive design with dark mode support
- **SEO Optimized** - Structured data, meta tags, and semantic HTML
- **Fast & Lightweight** - Built with Next.js for optimal performance

## 🛠️ Available Tools

### Main Tool (Homepage)
- Remove Emojis
- Remove Bullet Points
- Add/Remove Dots
- Remove Code Symbols
- AI Content Cleaning
- Remove Special Characters
- Real-time Statistics (words, characters, lines, sentences)

### Dedicated Tool Pages
1. **Remove Emojis** (`/remove-emojis`) - Remove all emoji characters from text
2. **Word Counter** (`/word-counter`) - Count words, characters, sentences with reading time
3. **Case Converter** (`/case-converter`) - Convert between uppercase, lowercase, title case, etc.

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Components**: Catalyst UI Kit
- **Styling**: Tailwind CSS v4
- **Headless UI**: @headlessui/react
- **Icons**: Heroicons
- **Animation**: Framer Motion

## 📦 Installation

```bash
npm install
```

## 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏭 Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.jsx              # Root layout with metadata
│   ├── page.jsx                # Homepage with all-in-one tool
│   ├── remove-emojis/          # Emoji remover tool
│   ├── word-counter/           # Word counter tool
│   └── case-converter/         # Case converter tool
├── components/
│   ├── button.jsx              # Catalyst button component
│   ├── textarea.jsx            # Catalyst textarea component
│   ├── heading.jsx             # Catalyst heading component
│   ├── tool-layout.jsx         # Shared layout for tool pages
│   └── structured-data.jsx     # SEO structured data components
└── styles/
    └── tailwind.css            # Tailwind CSS configuration
```

## 🎨 Catalyst UI Components Used

- `Button` - Action buttons with multiple variants
- `Textarea` - Text input with focus states
- `Heading` - Semantic headings
- `Link` - Navigation links
- Responsive grid layouts
- Dark mode support

## 🔍 SEO Features

- Semantic HTML structure
- Meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Structured Data (JSON-LD):
  - SoftwareApplication schema
  - FAQPage schema
  - BreadcrumbList schema
- Sitemap ready
- Mobile-friendly responsive design

## 🔒 Privacy

All text processing happens entirely in the browser. No data is sent to any server, ensuring complete privacy and security for users.

## 📝 License

This project uses the Catalyst UI Kit which is a commercial product licensed under the [Tailwind Plus license](https://tailwindcss.com/plus/license).
