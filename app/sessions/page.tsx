import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Timer, GraduationCap } from 'lucide-react'

export const revalidate = 60

export default async function SessionsPage() {
  const supabase = createServiceClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, exam_links(label, url)')
    .eq('status', 'open')
    .order('date', { ascending: true })

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-none">LCIC Admission Pre-Test</h1>
            <p className="text-xs text-slate-500 mt-0.5">Available Sessions</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Open Exam Sessions</h2>
          <p className="text-slate-500 mt-1 text-sm leading-relaxed">
            Select a session to register for the LCIC Pre-Admission Test. After registration you will receive
            an email with your exam access link and upload instructions.
          </p>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <GraduationCap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No open sessions at this time</p>
            <p className="text-sm mt-1">Please check back later or contact the admissions team.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sessions.map(session => {
              const sessionDate = new Date(session.date)
              const formattedDate = sessionDate.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 text-lg leading-tight">{session.title}</h3>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 shrink-0 ml-2">
                      Open
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Timer className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                  </div>

                  <Link href={`/sessions/${session.id}/register`}>
                    <Button className="w-full cursor-pointer">
                      Register for this session
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer className="text-center py-8 text-xs text-slate-400 border-t border-slate-200 mt-10">
        LCIC Admission Team &bull; Pre-Test Management Platform
      </footer>
    </div>
  )
}
