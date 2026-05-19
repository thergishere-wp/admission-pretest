'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, ExternalLink, CheckCircle } from 'lucide-react'

interface Upload {
  id: string
  file_url: string
  verified_at: string | null
  registrations: {
    full_name: string
    email: string
    phone: string
    gender: string
    country: string
    admission_number: string
    sessions: { title: string; date: string } | null
  } | null
}

export default function ApprovedTable({ uploads }: { uploads: Upload[] }) {
  const [search, setSearch] = useState('')

  const filtered = uploads.filter(u => {
    const r = u.registrations
    if (!r) return false
    const q = search.toLowerCase()
    return r.full_name.toLowerCase().includes(q) || r.admission_number.toLowerCase().includes(q)
  })

  if (uploads.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 text-slate-400">
        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="font-medium text-slate-600">No verified students yet</p>
        <p className="text-sm mt-1">Students will appear here once their results are verified.</p>
      </div>
    )
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
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Admission #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Gender</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Country</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Session Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Verified At</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No students match your search.
                  </td>
                </tr>
              ) : filtered.map(upload => {
                const r = upload.registrations!
                return (
                  <tr key={upload.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900 text-sm">{r.full_name}</p>
                      <p className="text-xs text-slate-400">{r.email}</p>
                      <p className="text-xs text-slate-400">{r.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600 font-mono">{r.admission_number}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-600">{r.gender}</td>
                    <td className="px-5 py-4 hidden md:table-cell text-sm text-slate-600">{r.country}</td>
                    <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-600">
                      {r.sessions?.date
                        ? new Date(r.sessions.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'
                      }
                    </td>
                    <td className="px-5 py-4 hidden xl:table-cell text-sm text-slate-600">
                      {upload.verified_at
                        ? new Date(upload.verified_at).toLocaleString()
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-slate-400">{filtered.length} of {uploads.length} verified students</p>
    </div>
  )
}
