'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExamLink } from '@/lib/types'
import { toast } from 'sonner'
import { Save, Link } from 'lucide-react'

export default function ExamLinksEditor({ examLinks, userId }: { examLinks: ExamLink[]; userId: string }) {
  const [urls, setUrls] = useState<Record<string, string>>(
    Object.fromEntries(examLinks.map(l => [l.id, l.url]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  async function saveLink(id: string) {
    setSaving(id)

    const { error } = await supabase
      .from('exam_links')
      .update({
        url: urls[id],
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)

    setSaving(null)

    if (error) {
      toast.error('Failed to save link')
      return
    }

    toast.success('Link saved')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
        <Link className="w-4 h-4 text-blue-500 shrink-0" />
        These links are sent to students in their confirmation email and shown during the exam session.
      </div>

      {examLinks.map(link => (
        <Card key={link.id} className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">{link.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor={`link-${link.id}`} className="sr-only">URL for {link.label}</Label>
                <Input
                  id={`link-${link.id}`}
                  type="url"
                  placeholder="https://exam-platform.example.com/..."
                  value={urls[link.id] || ''}
                  onChange={e => setUrls(prev => ({ ...prev, [link.id]: e.target.value }))}
                />
              </div>
              <Button
                onClick={() => saveLink(link.id)}
                disabled={saving === link.id}
                className="cursor-pointer shrink-0 gap-2"
              >
                <Save className="w-4 h-4" />
                {saving === link.id ? 'Saving…' : 'Save'}
              </Button>
            </div>
            {link.updated_at && (
              <p className="text-xs text-slate-400 mt-2">
                Last updated: {new Date(link.updated_at).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
