# Environment Setup Instructions

## CRITICAL: Create .env.local file

Create a file named `.env.local` in the `only-text-catalyst` folder with this exact content:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SITE_URL=https://only-text.com
```

## How to create:

1. Open Notepad or VS Code
2. Copy the 3 lines above
3. Save as `.env.local` in `c:\Users\lootj\Documents\text-only\only-text-catalyst\`
4. Make sure it's `.env.local` NOT `.env.local.txt`

## Security:

- ✅ `.env.local` is in `.gitignore` - will NOT be pushed to GitHub
- ✅ API keys are safe
- ✅ Only used server-side in Next.js API routes

## Verify:

After creating the file, restart the dev server:
```bash
npm run dev
```
