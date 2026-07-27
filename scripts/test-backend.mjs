/**
 * End-to-end test van de backend tegen de echte database.
 * Draait alles in een schone staat en laat de aannames hardop falen.
 *
 *   node scripts/test-backend.mjs
 */
import { connect } from './db.mjs'

const client = await connect()
let failures = 0

function check(label, condition, detail = '') {
  const mark = condition ? 'OK  ' : 'FOUT'
  if (!condition) failures++
  console.log(`${mark} ${label}${detail ? ` — ${detail}` : ''}`)
}

async function q(sql, params = []) {
  const r = await client.query(sql, params)
  return r.rows
}

async function reset() {
  await q(`truncate app.queue, app.rate_limits, app.viewers restart identity cascade`)
  await q(`delete from app.messages where client_hash <> 'seed'`)
  await q(`update app.messages set ended_at = null, duration_ms = null,
             min_until = clock_timestamp() - interval '1 second'
           where client_hash = 'seed'`)
  await q(`update app.site_stats set total_messages = 1, total_chars = 113, total_ms = 0 where id = 1`)
}

console.log('\n— opzet —')
await reset()
let cur = (await q(`select public.get_current() as j`))[0].j
check('er is precies één levend bericht', cur.message !== null, cur.message?.body?.slice(0, 40))
check('wachtrij is leeg', cur.queue_length === 0)

console.log('\n— iemand neemt de troon over —')
let res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  ['De eerste echte zin.', 'Lorenzo', 'hash-aaa', 'NL']))[0].j
check('plaatsing gelukt', res.ok === true, JSON.stringify(res.error ?? ''))
check('bericht staat meteen live', res.live === true)
check('vorige bericht is afgesloten', res.previous?.duration_ms >= 0,
  `duur ${res.previous?.duration_ms}ms`)

cur = (await q(`select public.get_current() as j`))[0].j
check('levend bericht is het nieuwe', cur.message.body === 'De eerste echte zin.')
check('minimumduur staat in de toekomst',
  new Date(cur.message.min_until) > new Date(), cur.message.min_until)

console.log('\n— tweede persoon tijdens de minimumduur —')
res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  ['Ik wil er ook op.', null, 'hash-bbb', 'DE']))[0].j
check('plaatsing geaccepteerd', res.ok === true)
check('maar in de wachtrij, niet live', res.queued === true && res.live === false)
check('positie 1', res.position === 1, `positie ${res.position}`)
check('claim-token teruggegeven', typeof res.claim_token === 'string')
check('geschatte wachttijd is positief', res.eta_ms > 0, `${res.eta_ms}ms`)

const token = res.claim_token
let status = (await q(`select public.get_queue_status($1) as j`, [token]))[0].j
check('wachtrijstatus opvraagbaar', status.found === true && status.status === 'waiting')

console.log('\n— derde persoon —')
res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  ['En ik dan.', 'derde', 'hash-ccc', 'BE']))[0].j
check('derde krijgt positie 2', res.position === 2, `positie ${res.position}`)

console.log('\n— dezelfde persoon nog eens —')
res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  ['Nog een poging.', null, 'hash-bbb', 'DE']))[0].j
check('wordt geweigerd wegens cooldown of dubbele plek',
  res.ok === false && ['cooldown', 'already_queued'].includes(res.error), res.error)

console.log('\n— tick voordat de tijd om is —')
let tick = (await q(`select public.tick() as j`))[0].j
check('bericht blijft staan', tick.message.body === 'De eerste echte zin.')
check('wachtrij nog steeds 2 lang', tick.queue_length === 2, `lengte ${tick.queue_length}`)

console.log('\n— tijd verstrijkt —')
await q(`update app.messages set min_until = clock_timestamp() - interval '1 second'
         where ended_at is null`)
tick = (await q(`select public.tick() as j`))[0].j
check('volgende uit de rij staat nu live', tick.message.body === 'Ik wil er ook op.', tick.message.body)
check('wachttijd is vastgelegd', tick.message.waited_ms > 0, `${tick.message.waited_ms}ms`)
check('herkomst is de wachtrij', tick.message.source === 'queue')
check('wachtrij is nu 1 lang', tick.queue_length === 1, `lengte ${tick.queue_length}`)

status = (await q(`select public.get_queue_status($1) as j`, [token]))[0].j
check('claim-token meldt bevorderd', status.status === 'promoted', JSON.stringify(status))

console.log('\n— er kan nooit meer dan één bericht live zijn —')
const live = await q(`select count(*)::int as n from app.messages where ended_at is null`)
check('exact één levend bericht', live[0].n === 1, `${live[0].n} gevonden`)

let raced = 0
try {
  await q(`insert into app.messages (body, char_count, word_count, client_hash, min_until)
           values ('sluiproute', 10, 1, 'hack', now())`)
} catch (e) {
  raced = 1
}
check('een tweede levend bericht wordt door de database geweigerd', raced === 1)

console.log('\n— dubbele tekst —')
// Eerst de rij leegmaken: anders haalt promote_if_due() eerst de volgende
// wachtende naar voren en vergelijk je met de verkeerde zin.
await q(`truncate app.queue restart identity`)
await q(`update app.messages set min_until = clock_timestamp() - interval '1 second'
         where ended_at is null`)
await q(`truncate app.rate_limits`)
const liveBody = (await q(`select body from app.messages where ended_at is null`))[0].body
res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  [liveBody, null, 'hash-ddd', 'NL']))[0].j
check('exact dezelfde zin wordt geweigerd', res.ok === false && res.error === 'duplicate', res.error)

console.log('\n— snelheidsbegrenzing —')
await q(`truncate app.rate_limits`)
await q(`update app.messages set min_until = clock_timestamp() - interval '1 second' where ended_at is null`)
await q(`select public.post_message('Eerste van deze persoon.', null, 'hash-eee', 'NL')`)
res = (await q(`select public.post_message($1,$2,$3,$4) as j`,
  ['Tweede binnen een minuut.', null, 'hash-eee', 'NL']))[0].j
check('tweede bericht binnen de cooldown wordt geweigerd',
  res.ok === false && res.error === 'cooldown', `${res.error}, nog ${res.retry_after}s`)

console.log('\n— kijkersteller —')
const n1 = (await q(`select public.heartbeat('11111111-1111-1111-1111-111111111111') as n`))[0].n
const n2 = (await q(`select public.heartbeat('22222222-2222-2222-2222-222222222222') as n`))[0].n
check('teller loopt op', n1 === 1 && n2 === 2, `${n1} daarna ${n2}`)
const peak = await q(`select peak_viewers from app.messages where ended_at is null`)
check('piek wordt op het bericht bijgehouden', peak[0].peak_viewers >= 2, `${peak[0].peak_viewers}`)

console.log('\n— melden haalt een bericht van de voorpagina —')
const liveId = (await q(`select id from app.messages where ended_at is null`))[0].id
for (const r of ['rep-1', 'rep-2', 'rep-3']) {
  await q(`select public.report_message($1, $2, 'test')`, [liveId, r])
}
const after = (await q(`select public.get_current() as j`))[0].j
check('gemeld bericht is niet meer zichtbaar', after.message?.id !== liveId,
  `nu: ${after.message?.body?.slice(0, 30)}`)
check('site is niet leeg gevallen', after.message !== null)

console.log('\n— archief en records —')
const archive = (await q(`select public.get_archive(null, 10, null) as j`))[0].j
check('archief bevat afgesloten berichten', Array.isArray(archive) && archive.length > 0,
  `${archive.length} rijen`)
check('archief lekt de bezoekershash niet', !JSON.stringify(archive).includes('client_hash'))
const records = (await q(`select public.get_records(10) as j`))[0].j
check('records geeft langste en kortste', Array.isArray(records.longest) && Array.isArray(records.shortest))

console.log('\n— rechten —')
const grants = await q(`
  select p.proname, has_function_privilege('anon', p.oid, 'execute') as anon_mag
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname in
    ('post_message','tick','report_message','get_current','get_archive','heartbeat')
  order by p.proname`)
for (const g of grants) {
  const moet = ['get_current', 'get_archive', 'heartbeat'].includes(g.proname)
  check(`anon ${moet ? 'mag' : 'mag NIET'} ${g.proname}()`, g.anon_mag === moet)
}
const tableAccess = await q(`
  select count(*)::int as n from information_schema.role_table_grants
  where table_schema = 'app' and grantee in ('anon','authenticated')`)
check('anon heeft geen enkel recht op tabellen in app', tableAccess[0].n === 0, `${tableAccess[0].n} rechten`)

console.log('\n— opruimen —')
await reset()
console.log(`\n${failures === 0 ? 'Alles goed.' : `${failures} controle(s) mislukt.`}\n`)
await client.end()
process.exit(failures === 0 ? 0 : 1)
