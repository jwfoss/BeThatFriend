import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: invites, error } = await supabase
      .from('invites')
      .select('id, contact_name, contact_email, status, created_at, sent_at')
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ invites })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contacts } = body

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts' }, { status: 400 })
    }

    const invitesToInsert = contacts.map((c: { name: string; email: string }) => ({
      inviter_id: user.id,
      contact_name: c.name,
      contact_email: c.email,
      status: 'queued',
    }))

    const { data: invites, error } = await (supabase as any)
      .from('invites')
      .insert(invitesToInsert)
      .select('id, contact_name, contact_email, status')

    if (error) throw error

    return NextResponse.json({ invites })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
