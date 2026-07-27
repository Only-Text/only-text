# only-text.com

One sentence sits at the top of this website. It belongs to whoever typed last.
Type something and it is yours, until the next person comes along. What counts
is not what you write but how long it survives.

## How it works

Every sentence gets a guaranteed minimum time on the front page. Without that,
a busy day would push the average reign down to milliseconds: everyone
overwrites everyone, nobody reads anything, and the whole point of the site
disappears exactly when the most people are watching. When it gets busy the
minimum drops from 60 seconds towards 10 and a queue forms, with a visible
position and an estimate.

Sharing happens through a permalink, never the front page. Social platforms
cache their scrape per URL and WhatsApp offers no way to refresh it, so a
preview image on the front page would freeze forever on whatever happened to be
up at first scrape. Every sentence gets its own immutable image instead.

## Stack

Next.js 16, React 19, Tailwind v4, Supabase Postgres with Realtime broadcast,
deployed on Vercel. No images anywhere except the generated share cards.

## Notable pieces

- `supabase/migrations/` - the schema. Exactly one live sentence is enforced by
  a partial unique index, the takeover is a single atomic function behind an
  advisory lock, and every table lives in a private schema that PostgREST does
  not serve.
- `src/lib/moderation.ts` - targeted slurs, hate and threats are blocked;
  ordinary swearing is not. Plain logic, no language model, so a sentence
  appears the instant you press enter.
- `src/lib/sanitize.ts` - unicode normalisation. Zalgo, zero-width characters,
  right-to-left overrides and homoglyphs are all neutralised before matching.
- `src/components/baseline-calibrator.tsx` - measures the font at runtime so
  text always lands exactly on the ruled lines, at any size.
- `src/components/pen-caret.tsx` - a caret shaped like a pen tip, because the
  native one is as tall as the line spacing and cuts through the ruling.

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase values
npm run dev
```

Tests run against the real database:

```bash
npm run test:moderation
npm run test:backend
```

## Machine readable

- `/raw` - the current sentence, nothing else
- `/api/current` - the current sentence as JSON
- `/feed.xml` - the last fifty sentences
- `/llms.txt` - for the half of web traffic that is not human
