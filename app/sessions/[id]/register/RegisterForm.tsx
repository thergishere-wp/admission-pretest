'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'
import { COUNTRIES } from '@/lib/countries'

const schema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(7, 'Phone number is required'),
  gender: z.enum(['Male', 'Female', 'Other'] as const).refine(v => v, { message: 'Gender is required' }),
  country: z.string().min(1, 'Country is required'),
  admission_number: z.string().min(2, 'Admission number is required'),
})

type FormData = z.infer<typeof schema>

export default function RegisterForm({ sessionId }: { sessionId: string }) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = form

  async function onSubmit(data: FormData) {
    setServerError('')
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, session_id: sessionId }),
    })

    const json = await res.json()

    if (!res.ok) {
      setServerError(json.error || 'Something went wrong. Please try again.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Confirmed!</h2>
        <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
          Please check your email inbox. We&apos;ve sent you the session details, exam access link, and your
          personal upload link.
        </p>
        <p className="text-slate-400 text-sm mt-4">
          Didn&apos;t receive an email? Check your spam folder or contact the admissions team.
        </p>
      </div>
    )
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle>Student Registration</CardTitle>
        <CardDescription>Fill in your details to register. All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" placeholder="John Doe" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+1 555 0000" {...register('phone')} />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(v: string | null) => v && setValue('gender', v as 'Male' | 'Female' | 'Other')}>
                <SelectTrigger id="gender" className="cursor-pointer">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select onValueChange={(v: string | null) => v && setValue('country', v)}>
                <SelectTrigger id="country" className="cursor-pointer">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-64 overflow-y-auto">
                  {COUNTRIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admission_number">Admission Number</Label>
            <Input id="admission_number" placeholder="e.g. ADM-2026-001" {...register('admission_number')} />
            {errors.admission_number && <p className="text-xs text-red-500">{errors.admission_number.message}</p>}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
