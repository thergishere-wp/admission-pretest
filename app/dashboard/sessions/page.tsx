import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, CalendarDays } from 'lucide-react'
import SessionActions from './SessionActions'

export default async function SessionsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, exam_links(label, url)')
    .order('date', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage pre-test exam sessions</p>
        </div>
        <Link href="/dashboard/sessions/new">
          <Button className="cursor-pointer gap-2">
            <Plus className="w-4 h-4" />
            New Session
          </Button>
        </Link>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-slate-200">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No sessions yet</p>
          <p className="text-sm mt-1">Create your first exam session to get started.</p>
          <Link href="/dashboard/sessions/new">
            <Button className="mt-4 cursor-pointer gap-2">
              <Plus className="w-4 h-4" />
              Create Session
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Session</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Exam Link</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map(session => (
                <tr key={session.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-sm">{session.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{session.duration_minutes} min</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {session.time}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-sm text-slate-600">
                      {(session.exam_links as { label?: string })?.label || 'None'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={session.status === 'open'
                        ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                        : 'text-slate-500 border-slate-200 bg-slate-50'
                      }
                    >
                      {session.status === 'open' ? 'Open' : 'Closed'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <SessionActions session={session} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
