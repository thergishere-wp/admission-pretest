import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardNav profile={profile} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-screen-xl">
          {children}
        </main>
      </div>
    </div>
  )
}
