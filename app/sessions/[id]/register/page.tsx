import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RegisterForm from './RegisterForm'
import { GraduationCap, Calendar, Clock, Timer } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default async function RegisterPage({ params }: Props) {
  const supabase = createServiceClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('*, exam_links(label, url)')
    .eq('id', params.id)
    .eq('status', 'open')
    .single()

  if (!session) notFound()

  const sessionDate = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-none">LCIC Admission Pre-Test</h1>
            <p className="text-xs text-slate-500 mt-0.5">Session Registration</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
          <h2 className="font-semibold text-slate-900 text-lg mb-3">{session.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>{sessionDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>{session.time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Timer className="w-4 h-4 text-primary shrink-0" />
              <span>{session.duration_minutes} minutes</span>
            </div>
          </div>
        </div>

        <RegisterForm sessionId={session.id} />
      </main>
    </div>
  )
}
