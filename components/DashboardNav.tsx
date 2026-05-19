'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  GraduationCap, LayoutDashboard, CalendarDays, Users, Settings,
  ShieldCheck, CheckSquare, LogOut, ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface Props {
  profile: Profile
}

const navItems = {
  admin: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/sessions', label: 'Sessions', icon: CalendarDays },
    { href: '/dashboard/students', label: 'Students', icon: Users },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ],
  teacher: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/verify', label: 'Verify Uploads', icon: ShieldCheck },
  ],
  admission: [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/approved', label: 'Verified Students', icon: CheckSquare },
  ],
}

export default function DashboardNav({ profile }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const items = navItems[profile.role] || []

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  function isActive(item: { href: string; exact?: boolean }) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const roleBadge: Record<string, string> = {
    admin: 'bg-primary/10 text-primary',
    teacher: 'bg-emerald-100 text-emerald-700',
    admission: 'bg-violet-100 text-violet-700',
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">LCIC Pre-Test</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          aria-label="Toggle menu"
        >
          <ChevronRight className={cn('w-5 h-5 text-slate-600 transition-transform', open && 'rotate-90')} />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-slate-200 p-4 space-y-1"
            onClick={e => e.stopPropagation()}
          >
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  isActive(item)
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 z-20">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm leading-none">LCIC Pre-Test</p>
              <p className="text-xs text-slate-400 mt-0.5">Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                isActive(item)
                  ? 'bg-primary text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-900 truncate">{profile.full_name || profile.email}</p>
            <span className={cn(
              'inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full capitalize',
              roleBadge[profile.role]
            )}>
              {profile.role}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top spacer */}
      <div className="lg:hidden h-14" />
    </>
  )
}
