import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inviteId } = body

    if (!inviteId) {
      return NextResponse.json({ error: 'Missing inviteId' }, { status: 400 })
    }

    // Update invite status
    const { error } = await (supabase as any)
      .from('invites')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .eq('id', inviteId)
      .eq('inviter_id', user.id) // Ensure user owns this invite

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
