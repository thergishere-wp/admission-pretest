'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ShieldCheck, ExternalLink } from 'lucide-react'

interface Upload {
  id: string
  file_url: string
  uploaded_at: string
  status: 'pending' | 'verified'
  registrations: {
    full_name: string
    admission_number: string
    country: string
    sessions: { title: string; date: string } | null
  } | null
}

export default function VerifyTable({ uploads, verifierId }: { uploads: Upload[]; verifierId: string }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function markVerified(uploadId: string) {
    setLoadingId(uploadId)

    const { error } = await supabase
      .from('uploads')
      .update({
        status: 'verified',
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', uploadId)

    setLoadingId(null)

    if (error) {
      toast.error('Failed to verify upload')
      return
    }

    toast.success('Upload marked as verified')
    router.refresh()
  }

  if (uploads.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400">
        <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="font-medium text-slate-600">All caught up!</p>
        <p className="text-sm mt-1">No pending uploads to verify.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admission #</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Country</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Session Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">File</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {uploads.map(upload => (
              <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <p className="font-medium text-slate-900 text-sm">{upload.registrations?.full_name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{upload.registrations?.sessions?.title}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-600 font-mono">{upload.registrations?.admission_number}</td>
                <td className="px-5 py-4 hidden md:table-cell text-sm text-slate-600">{upload.registrations?.country}</td>
                <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-600">
                  {upload.registrations?.sessions?.date
                    ? new Date(upload.registrations.sessions.date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                      })
                    : '—'
                  }
                </td>
                <td className="px-5 py-4">
                  <a
                    href={upload.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline cursor-pointer"
                  >
                    View PDF
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </td>
                <td className="px-5 py-4 text-right">
                  <Button
                    size="sm"
                    onClick={() => markVerified(upload.id)}
                    disabled={loadingId === upload.id}
                    className="cursor-pointer gap-1.5 text-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {loadingId === upload.id ? 'Saving…' : 'Mark Verified'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
