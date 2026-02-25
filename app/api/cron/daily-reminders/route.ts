import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Reminder {
  recipient_email: string
  recipient_name: string
  friend_name: string
  date_label: string
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createServiceClient()

    // Get today's reminders using the database function
    const { data, error } = await supabase.rpc('get_todays_reminders')

    if (error) throw error

    const reminders = (data || []) as Reminder[]

    if (reminders.length === 0) {
      return NextResponse.json({ message: 'No reminders for today', sent: 0 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bethatfriend.app'
    let sent = 0
    let failed = 0

    for (const reminder of reminders) {
      const { error: emailError } = await resend.emails.send({
        from: 'BeThatFriend <hello@bethatfriend.app>',
        to: reminder.recipient_email,
        subject: `Don't forget — ${reminder.friend_name}'s ${reminder.date_label} is today!`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Don't forget!</h2>
            <p>Hey ${reminder.recipient_name},</p>
            <p>Just a friendly reminder that today is <strong>${reminder.friend_name}</strong>'s <strong>${reminder.date_label}</strong>!</p>
            <p>Make sure to reach out and make their day special.</p>
            <p style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}" style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                Open Be That Friend
              </a>
            </p>
          </div>
        `,
      })

      if (emailError) {
        console.error(`Failed to send reminder to ${reminder.recipient_email}:`, emailError)
        failed++
      } else {
        sent++
      }
    }

    return NextResponse.json({
      message: 'Daily reminders processed',
      total: reminders.length,
      sent,
      failed,
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
