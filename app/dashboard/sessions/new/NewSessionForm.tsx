'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { ExamLink } from '@/lib/types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  title: z.string().min(3, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  exam_link_id: z.string().min(1, 'Exam link is required'),
})

type FormData = z.infer<typeof schema>

export default function NewSessionForm({ examLinks, userId }: { examLinks: ExamLink[]; userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    const { error } = await supabase.from('sessions').insert({
      ...data,
      duration_minutes: 60,
      status: 'open',
      created_by: userId,
    })

    if (error) {
      toast.error('Failed to create session')
      return
    }

    toast.success('Session created successfully')
    router.push('/dashboard/sessions')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/sessions">
        <Button variant="ghost" size="sm" className="gap-2 cursor-pointer -ml-2 text-slate-500">
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Button>
      </Link>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title</Label>
              <Input id="title" placeholder="e.g. Session A — May 2026" {...register('title')} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...register('time')} />
                {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exam_link_id">Exam Link</Label>
              <Select onValueChange={(v: string | null) => v && setValue('exam_link_id', v)}>
                <SelectTrigger id="exam_link_id" className="cursor-pointer">
                  <SelectValue placeholder="Select exam link" />
                </SelectTrigger>
                <SelectContent>
                  {examLinks.map(link => (
                    <SelectItem key={link.id} value={link.id}>
                      <span className="font-medium">{link.label}</span>
                      <span className="ml-2 text-slate-400 text-xs truncate max-w-48 inline-block">{link.url}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.exam_link_id && <p className="text-xs text-red-500">{errors.exam_link_id.message}</p>}
            </div>

            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Session'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
