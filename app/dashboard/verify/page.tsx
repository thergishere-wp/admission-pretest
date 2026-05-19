import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VerifyTable from './VerifyTable'

export default async function VerifyPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'teacher'].includes(profile.role)) redirect('/dashboard')

  const { data: uploads } = await supabase
    .from('uploads')
    .select('*, registrations(full_name, admission_number, country, sessions(title, date))')
    .eq('status', 'pending')
    .order('uploaded_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Verify Uploads</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Review uploaded result files and mark them as verified for the admissions team.
        </p>
      </div>

      <VerifyTable uploads={uploads || []} verifierId={user.id} />
    </div>
  )
}
