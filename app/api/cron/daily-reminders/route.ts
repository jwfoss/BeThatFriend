import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// TODO: Implement Email Digest service
// - Daily/weekly email reminders for upcoming dates
// - Use SendGrid, Resend, or AWS SES
// - Create email templates with HTML formatting
// - Handle unsubscribe links per CAN-SPAM compliance

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

    // TODO: Implement email sending
    // For now, just return the reminders that would be sent
    return NextResponse.json({
      message: 'Daily reminders processed (email sending not yet implemented)',
      total: reminders.length,
      sent: 0,
      pending: reminders.length,
      reminders: reminders.map((r) => ({
        recipient_email: r.recipient_email,
        recipient_name: r.recipient_name,
        friend_name: r.friend_name,
        date_label: r.date_label,
      })),
    })
  } catch (error: any) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
