import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { session_id, full_name, email, phone, gender, country, admission_number } = body

    if (!session_id || !full_name || !email || !phone || !gender || !country || !admission_number) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Fetch session + exam link
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, exam_links(*)')
      .eq('id', session_id)
      .eq('status', 'open')
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found or closed' }, { status: 404 })
    }

    const upload_token = uuidv4()

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .insert({
        session_id,
        full_name,
        email,
        phone,
        gender,
        country,
        admission_number,
        upload_token,
        upload_status: 'pending',
      })
      .select()
      .single()

    if (regError) {
      return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const uploadUrl = `${siteUrl}/upload/${upload_token}`
    const examUrl = session.exam_links?.url || '#'

    const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    await resend.emails.send({
      from: 'LCIC Admissions <admissions@lcic.edu>',
      to: email,
      subject: `LCIC Pre-Test Registration Confirmed — ${session.title}`,
      html: buildEmailHtml({
        full_name,
        session_title: session.title,
        session_date: sessionDate,
        session_time: session.time,
        duration: session.duration_minutes,
        exam_url: examUrl,
        upload_url: uploadUrl,
      }),
    })

    return NextResponse.json({ success: true, registration_id: registration.id })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildEmailHtml(data: {
  full_name: string
  session_title: string
  session_date: string
  session_time: string
  duration: number
  exam_url: string
  upload_url: string
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#1e3a5f;padding:32px 40px;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">LCIC Admission Pre-Test</h1>
      <p style="margin:8px 0 0;color:#93c5fd;font-size:14px;">Registration Confirmed</p>
    </div>
    <div style="padding:40px;">
      <p style="margin:0 0 24px;color:#374151;font-size:16px;">Dear <strong>${data.full_name}</strong>,</p>
      <p style="margin:0 0 24px;color:#374151;font-size:15px;line-height:1.6;">
        Your registration for the LCIC Pre-Admission Test has been confirmed. Please review the details below.
      </p>

      <div style="background:#f1f5f9;border-radius:8px;padding:24px;margin-bottom:32px;">
        <h2 style="margin:0 0 16px;color:#1e3a5f;font-size:16px;font-weight:600;">Session Details</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;width:140px;">Session</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${data.session_title}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Date</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${data.session_date}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Time</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${data.session_time}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;font-size:14px;">Duration</td>
            <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:500;">${data.duration} minutes</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom:32px;">
        <a href="${data.exam_url}" style="display:inline-block;background:#1e3a5f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
          Access Exam
        </a>
      </div>

      <div style="border-left:3px solid #1e3a5f;padding:16px 20px;background:#eff6ff;border-radius:0 8px 8px 0;margin-bottom:32px;">
        <h3 style="margin:0 0 12px;color:#1e3a5f;font-size:15px;font-weight:600;">Rules &amp; Guidelines</h3>
        <ul style="margin:0;padding:0 0 0 16px;color:#374151;font-size:14px;line-height:2;">
          <li>Join the session on time — late entries may not be accepted</li>
          <li>Ensure you have a stable internet connection before starting</li>
          <li>Do not close or navigate away from the exam window during the test</li>
          <li>Complete the exam fully before exiting</li>
          <li>After completion, download your result file immediately</li>
          <li>Use the upload link below to submit your result file</li>
        </ul>
      </div>

      <div style="margin-bottom:32px;">
        <p style="margin:0 0 12px;color:#374151;font-size:14px;">Submit your result file using the link below:</p>
        <a href="${data.upload_url}" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
          Upload Result File
        </a>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:13px;">
        If you have any questions, please contact the LCIC Admission Team.<br>
        Do not reply to this email.
      </p>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#9ca3af;font-size:13px;">LCIC Admission Team &bull; Pre-Test Management Platform</p>
    </div>
  </div>
</body>
</html>
  `
}
