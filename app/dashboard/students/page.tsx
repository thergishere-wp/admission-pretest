import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentsTable from './StudentsTable'

export default async function StudentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: registrations } = await supabase
    .from('registrations')
    .select('*, sessions(title, date)')
    .order('registered_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="text-slate-500 mt-1 text-sm">All registered students across all sessions</p>
      </div>

      <StudentsTable registrations={registrations || []} />
    </div>
  )
}
