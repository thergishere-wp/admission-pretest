import { createServiceClient } from '@/lib/supabase/server'
import UploadForm from './UploadForm'
import { GraduationCap, AlertTriangle, CheckCircle } from 'lucide-react'

interface Props {
  params: { token: string }
}

export default async function UploadPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: registration } = await supabase
    .from('registrations')
    .select('*, sessions(title, date, time)')
    .eq('upload_token', params.token)
    .single()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-none">LCIC Admission Pre-Test</h1>
            <p className="text-xs text-slate-500 mt-0.5">Result Upload</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {!registration ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Upload Link</h2>
            <p className="text-slate-500">This upload link is invalid or has expired.</p>
          </div>
        ) : registration.upload_status === 'uploaded' ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Already Submitted</h2>
            <p className="text-slate-500">
              Your result file has already been uploaded. The admissions team will review it shortly.
            </p>
          </div>
        ) : registration.upload_status === 'closed' ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Upload Window Closed</h2>
            <p className="text-slate-500">
              The upload window for this submission has been closed. Please contact the admissions team for
              assistance.
            </p>
          </div>
        ) : (
          <UploadForm
            token={params.token}
            studentName={registration.full_name}
            sessionTitle={(registration.sessions as { title?: string })?.title || ''}
          />
        )}
      </main>
    </div>
  )
}
