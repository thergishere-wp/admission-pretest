'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

interface Registration {
  id: string
  full_name: string
  email: string
  admission_number: string
  upload_status: 'pending' | 'uploaded' | 'closed'
  registered_at: string
  sessions: { title: string; date: string } | null
}

const statusColors = {
  pending: 'text-amber-700 border-amber-200 bg-amber-50',
  uploaded: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  closed: 'text-slate-500 border-slate-200 bg-slate-50',
}

export default function StudentsTable({ registrations }: { registrations: Registration[] }) {
  const [search, setSearch] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const filtered = registrations.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.admission_number.toLowerCase().includes(search.toLowerCase())
  )

  async function reopenUpload(id: string) {
    setLoadingId(id)
    const { error } = await supabase
      .from('registrations')
      .update({ upload_status: 'pending' })
      .eq('id', id)

    setLoadingId(null)

    if (error) {
      toast.error('Failed to reopen upload')
      return
    }

    toast.success('Upload reopened for student')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or admission number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admission #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Session</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Upload Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400 text-sm">
                    {search ? 'No students match your search.' : 'No registrations yet.'}
                  </td>
                </tr>
              ) : filtered.map(reg => (
                <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-900 text-sm">{reg.full_name}</p>
                    <p className="text-xs text-slate-400">{reg.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-mono">{reg.admission_number}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-sm text-slate-600">{reg.sessions?.title || '—'}</p>
                    {reg.sessions?.date && (
                      <p className="text-xs text-slate-400">
                        {new Date(reg.sessions.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="outline" className={statusColors[reg.upload_status]}>
                      {reg.upload_status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {reg.upload_status === 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => reopenUpload(reg.id)}
                        disabled={loadingId === reg.id}
                        className="cursor-pointer gap-1.5 text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reopen Upload
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} of {registrations.length} students</p>
    </div>
  )
}
