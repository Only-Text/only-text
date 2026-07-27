import { readFileSync } from 'node:fs'
for (const r of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = r.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const { bluesky, inbox } = await import('../src/lib/bluesky.ts')

const agent = await bluesky()
console.log('ingelogd als  :', agent.session?.handle)
const p = await agent.getProfile({ actor: agent.session.did })
console.log('weergavenaam  :', p.data.displayName)
console.log('volgers       :', p.data.followersCount, '| berichten:', p.data.postsCount)
const box = await inbox(10)
console.log('inbox         :', box.length, 'berichten (lezen werkt)')
