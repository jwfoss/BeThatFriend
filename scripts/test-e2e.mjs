/**
 * End-to-end test: full user journey
 * User A signs up, adds dates, invites User B.
 * User B joins via invite link, adds dates.
 * Both should see each other's dates in their dashboards.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mblbuqsynchvtlguuadu.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibGJ1cXN5bmNodnRsZ3V1YWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTc5NjAxOSwiZXhwIjoyMDg1MzcyMDE5fQ.qEfwuyGUvL8GPV0e6cE7Kzmzk923hqHQu_Uaz5qjvXs'

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function pass(msg) { console.log(`  ✓ ${msg}`) }
function fail(msg, detail) { console.error(`  ✗ ${msg}`, detail || '') }
function section(msg) { console.log(`\n── ${msg}`) }

const testIds = { userA: null, userB: null }

async function cleanup() {
  section('Cleanup: deleting test data')
  // Delete auth users (cascades to app data via RLS but not the users table)
  for (const id of Object.values(testIds)) {
    if (!id) continue
    await admin.from('important_dates').delete().eq('user_id', id)
    await admin.from('connections').delete().or(`user_a_id.eq.${id},user_b_id.eq.${id}`)
    await admin.from('invites').delete().eq('inviter_id', id)
    await admin.from('users').delete().eq('id', id)
    await admin.auth.admin.deleteUser(id)
  }
  pass('Test data cleaned up')
}

async function run() {
  console.log('BeThatFriend — End-to-End Test')
  console.log('================================')

  // ── STEP 1: Create User A ──────────────────────────────────────────────────
  section('Step 1: Create User A (the inviter)')
  const { data: authA, error: errA } = await admin.auth.admin.createUser({
    email: 'test-user-a@bethatfriend-test.dev',
    password: 'TestPass1!',
    email_confirm: true,
  })
  if (errA) { fail('Create User A auth', errA.message); await cleanup(); return }
  testIds.userA = authA.user.id
  pass(`Auth created: ${authA.user.email} (${authA.user.id})`)

  const inviteCodeA = 'TESTA001'
  const { error: profileErrA } = await admin.from('users').insert({
    id: authA.user.id,
    email: authA.user.email,
    name: 'Alice',
    invite_code: inviteCodeA,
  })
  if (profileErrA) { fail('Create User A profile', profileErrA.message); await cleanup(); return }
  pass('Profile created: Alice')

  // ── STEP 2: Add dates for User A ──────────────────────────────────────────
  section('Step 2: Add important dates for Alice')
  const datesA = [
    { user_id: authA.user.id, label: 'Birthday', date_month: 3, date_day: 15 },
    { user_id: authA.user.id, label: 'Work Anniversary', date_month: 7, date_day: 4 },
    { user_id: authA.user.id, label: 'Wedding Anniversary', date_month: 11, date_day: 22 },
  ]
  const { error: datesErrA } = await admin.from('important_dates').insert(datesA)
  if (datesErrA) { fail('Insert dates for Alice', datesErrA.message); await cleanup(); return }
  pass(`${datesA.length} dates added for Alice`)

  // ── STEP 3: Alice sends an invite to Bob ───────────────────────────────────
  section('Step 3: Alice invites Bob via /circle')
  const { data: invite, error: inviteErr } = await admin.from('invites').insert({
    inviter_id: authA.user.id,
    contact_name: 'Bob',
    contact_email: 'test-user-b@bethatfriend-test.dev',
    status: 'sent',
  }).select('id').single()
  if (inviteErr) { fail('Create invite', inviteErr.message); await cleanup(); return }
  pass(`Invite created (id: ${invite.id})`)

  // ── STEP 4: Bob signs up ───────────────────────────────────────────────────
  section('Step 4: Bob signs up and completes onboarding')
  const { data: authB, error: errB } = await admin.auth.admin.createUser({
    email: 'test-user-b@bethatfriend-test.dev',
    password: 'TestPass1!',
    email_confirm: true,
  })
  if (errB) { fail('Create User B auth', errB.message); await cleanup(); return }
  testIds.userB = authB.user.id
  pass(`Auth created: ${authB.user.email} (${authB.user.id})`)

  const { error: profileErrB } = await admin.from('users').insert({
    id: authB.user.id,
    email: authB.user.email,
    name: 'Bob',
    invite_code: 'TESTB001',
  })
  if (profileErrB) { fail('Create User B profile', profileErrB.message); await cleanup(); return }
  pass('Profile created: Bob')

  // ── STEP 5: Bob adds his dates ────────────────────────────────────────────
  section("Step 5: Bob adds his important dates")
  const datesB = [
    { user_id: authB.user.id, label: "Bob's Birthday", date_month: 6, date_day: 10 },
    { user_id: authB.user.id, label: 'Graduation Day', date_month: 5, date_day: 20 },
    { user_id: authB.user.id, label: 'First Day at Job', date_month: 1, date_day: 8 },
  ]
  const { error: datesErrB } = await admin.from('important_dates').insert(datesB)
  if (datesErrB) { fail("Insert Bob's dates", datesErrB.message); await cleanup(); return }
  pass(`${datesB.length} dates added for Bob`)

  // ── STEP 6: Bob joins Alice's circle ──────────────────────────────────────
  section("Step 6: Bob visits /join/TESTA001 and accepts")
  const { error: connErr } = await admin.from('connections').insert({
    user_a_id: authA.user.id,
    user_b_id: authB.user.id,
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  })
  if (connErr) { fail('Create connection', connErr.message); await cleanup(); return }
  pass('Connection created (confirmed)')

  // Update invite to accepted
  await admin.from('invites').update({ status: 'accepted', accepted_at: new Date().toISOString() }).eq('id', invite.id)
  pass('Invite marked accepted')

  // ── STEP 7: Verify Alice sees Bob's dates ─────────────────────────────────
  section("Step 7: Verify Alice's dashboard shows Bob's dates")
  const { data: aliceDates, error: aliceDatesErr } = await admin.rpc('get_connection_dates', { p_user_id: authA.user.id })
  if (aliceDatesErr) { fail("get_connection_dates for Alice", aliceDatesErr.message) }
  else if (!aliceDates || aliceDates.length === 0) {
    fail("Alice sees 0 connection dates — expected Bob's dates")
  } else {
    pass(`Alice sees ${aliceDates.length} dates from her circle`)
    aliceDates.forEach(d => console.log(`    → ${d.connection_name || d.owner_name}: ${d.date_label || d.label} (${d.date_month}/${d.date_day})`))
  }

  // ── STEP 8: Verify Bob sees Alice's dates ─────────────────────────────────
  section("Step 8: Verify Bob's dashboard shows Alice's dates")
  const { data: bobDates, error: bobDatesErr } = await admin.rpc('get_connection_dates', { p_user_id: authB.user.id })
  if (bobDatesErr) { fail("get_connection_dates for Bob", bobDatesErr.message) }
  else if (!bobDates || bobDates.length === 0) {
    fail("Bob sees 0 connection dates — expected Alice's dates")
  } else {
    pass(`Bob sees ${bobDates.length} dates from his circle`)
    bobDates.forEach(d => console.log(`    → ${d.connection_name || d.owner_name}: ${d.date_label || d.label} (${d.date_month}/${d.date_day})`))
  }

  // ── STEP 9: Check column names returned by get_connection_dates ───────────
  section("Step 9: Check column names from get_connection_dates (dashboard compatibility)")
  if (aliceDates && aliceDates.length > 0) {
    const sample = aliceDates[0]
    const cols = Object.keys(sample)
    console.log(`    Columns returned: ${cols.join(', ')}`)
    const hasOwnerName = 'connection_name' in sample
    const hasLabel = 'date_label' in sample
    if (!hasOwnerName) fail("Missing 'connection_name' column")
    else pass("'connection_name' column present")
    if (!hasLabel) fail("Missing 'date_label' column")
    else pass("'date_label' column present")
  }

  // ── Cleanup ────────────────────────────────────────────────────────────────
  await cleanup()
  console.log('\n================================')
  console.log('Test complete.')
}

run().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
