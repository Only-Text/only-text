/**
 * Directe databaseverbinding voor migraties en controles.
 * Gebruik:  node scripts/db.mjs "select 1"
 *           node scripts/db.mjs --file supabase/migrations/0002_x.sql
 *
 * Het wachtwoord komt uit .env.local (SUPABASE_DB_PASSWORD) en staat dus
 * niet in de code. Supabase's directe host is IPv6-only, dus we proberen
 * eerst de pooler en vallen daarna terug op direct.
 */
import { readFileSync } from 'node:fs'
import { Client } from 'pg'

function loadEnv() {
  const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}
loadEnv()

const REF = 'ptqdhbxrimrcjcgbosxo'
const PASSWORD = process.env.SUPABASE_DB_PASSWORD
if (!PASSWORD) throw new Error('SUPABASE_DB_PASSWORD ontbreekt in .env.local')

const CANDIDATES = [
  { label: 'pooler-session-eu-central-1', host: 'aws-0-eu-central-1.pooler.supabase.com', port: 5432, user: `postgres.${REF}` },
  { label: 'pooler-session-aws-1',        host: 'aws-1-eu-central-1.pooler.supabase.com', port: 5432, user: `postgres.${REF}` },
  { label: 'direct',                      host: `db.${REF}.supabase.co`,                  port: 5432, user: 'postgres' },
]

export async function connect() {
  let lastError
  for (const c of CANDIDATES) {
    const client = new Client({
      host: c.host,
      port: c.port,
      user: c.user,
      password: PASSWORD,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
      statement_timeout: 120000,
    })
    try {
      await client.connect()
      if (process.env.DB_VERBOSE) console.error(`verbonden via ${c.label}`)
      return client
    } catch (err) {
      lastError = err
      try { await client.end() } catch {}
    }
  }
  throw new Error(`Geen verbinding mogelijk. Laatste fout: ${lastError?.message}`)
}

if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/') || process.argv[1]?.endsWith('db.mjs')) {
  const args = process.argv.slice(2)
  let sql
  if (args[0] === '--file') {
    sql = readFileSync(args[1], 'utf8')
  } else {
    sql = args.join(' ')
  }
  if (!sql) {
    console.error('Geef SQL of --file <pad> mee.')
    process.exit(1)
  }

  const client = await connect()
  try {
    const result = await client.query(sql)
    const results = Array.isArray(result) ? result : [result]
    for (const r of results) {
      if (r.rows?.length) {
        console.log(JSON.stringify(r.rows, null, 2))
      } else {
        console.log(`${r.command ?? 'OK'} — ${r.rowCount ?? 0} rijen`)
      }
    }
  } finally {
    await client.end()
  }
}
