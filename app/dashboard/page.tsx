import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, Users, Upload, ShieldCheck } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const [
    { count: sessionCount },
    { count: registrationCount },
    { count: uploadCount },
    { count: pendingCount },
  ] = await Promise.all([
    supabase.from('sessions').select('*', { count: 'exact', head: true }),
    supabase.from('registrations').select('*', { count: 'exact', head: true }),
    supabase.from('uploads').select('*', { count: 'exact', head: true }),
    supabase.from('uploads').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Total Sessions', value: sessionCount ?? 0, icon: CalendarDays, color: 'text-primary bg-primary/10' },
    { label: 'Registrations', value: registrationCount ?? 0, icon: Users, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Files Uploaded', value: uploadCount ?? 0, icon: Upload, color: 'text-violet-600 bg-violet-100' },
    { label: 'Pending Verification', value: pendingCount ?? 0, icon: ShieldCheck, color: 'text-amber-600 bg-amber-100' },
  ]

  const greeting = profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}` : 'Welcome back'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{greeting}</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Here&apos;s an overview of the pre-test platform activity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <Card key={stat.label} className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.label}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
