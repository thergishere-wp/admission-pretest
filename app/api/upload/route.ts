import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const token = formData.get('token') as string
    const file = formData.get('file') as File

    if (!token || !file) {
      return NextResponse.json({ error: 'Token and file are required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: registration, error: regError } = await supabase
      .from('registrations')
      .select('*')
      .eq('upload_token', token)
      .single()

    if (regError || !registration) {
      return NextResponse.json({ error: 'Invalid upload token' }, { status: 404 })
    }

    if (registration.upload_status === 'uploaded') {
      return NextResponse.json({ error: 'File already uploaded' }, { status: 409 })
    }

    if (registration.upload_status === 'closed') {
      return NextResponse.json({ error: 'Upload window is closed' }, { status: 403 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${registration.id}/${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('exam-results')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('exam-results')
      .getPublicUrl(fileName)

    await supabase.from('uploads').insert({
      registration_id: registration.id,
      file_url: publicUrl,
    })

    await supabase
      .from('registrations')
      .update({ upload_status: 'uploaded' })
      .eq('id', registration.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
