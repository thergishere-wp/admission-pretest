import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewSessionForm from './NewSessionForm'

export default async function NewSessionPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: examLinks } = await supabase
    .from('exam_links')
    .select('*')
    .order('label')

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create Session</h1>
        <p className="text-slate-500 mt-1 text-sm">Set up a new pre-test exam session for students.</p>
      </div>

      <NewSessionForm examLinks={examLinks || []} userId={user.id} />
    </div>
  )
}
