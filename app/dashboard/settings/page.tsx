import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExamLinksEditor from './ExamLinksEditor'

export default async function SettingsPage() {
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
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1 text-sm">Manage exam access links</p>
      </div>

      <ExamLinksEditor examLinks={examLinks || []} userId={user.id} />
    </div>
  )
}
