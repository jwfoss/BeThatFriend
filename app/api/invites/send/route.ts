import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Fetch invite + inviter details
    const { data: invite, error: inviteError } = await (supabase as any)
      .from('invites')
      .select('contact_name, contact_email, inviter_id, inviter:users(name, invite_code)')
      .eq('id', inviteId)
      .eq('inviter_id', user.id)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    if (!invite.contact_email) {
      return NextResponse.json({ error: 'No email address for this contact' }, { status: 400 })
    }

    const inviterName = invite.inviter?.name ?? 'Your friend'
    const inviteCode = invite.inviter?.invite_code
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bethatfriend.app'
    const joinUrl = `${appUrl}/join/${inviteCode}`

    const { error: emailError } = await resend.emails.send({
      from: 'BeThatFriend <hello@bethatfriend.app>',
      to: invite.contact_email,
      subject: `${invite.contact_name}, join ${inviterName}'s Be That Friend circle!`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>You've been invited!</h2>
          <p>Hey ${invite.contact_name},</p>
          <p><strong>${inviterName}</strong> is using Be That Friend to remember important dates for the people they care about — and they want you in their circle.</p>
          <p>Join now so ${inviterName} never misses your birthday or other special dates:</p>
          <p style="text-align: center; margin: 32px 0;">
            <a href="${joinUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Accept Invite
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${joinUrl}</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Mark invite as sent
    const { error: updateError } = await (supabase as any)
      .from('invites')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', inviteId)
      .eq('inviter_id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send invite error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
