import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApprovedTable from './ApprovedTable'

export default async function ApprovedPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'teacher', 'admission'].includes(profile.role)) redirect('/dashboard')

  const { data: uploads } = await supabase
    .from('uploads')
    .select('*, registrations(full_name, email, phone, gender, country, admission_number, sessions(title, date))')
    .eq('status', 'verified')
    .order('verified_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Verified Students</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Students whose result files have been verified and are ready for admission review.
        </p>
      </div>

      <ApprovedTable uploads={uploads || []} />
    </div>
  )
}
