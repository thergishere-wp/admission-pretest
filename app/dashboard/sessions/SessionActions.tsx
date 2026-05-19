'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Session } from '@/lib/types'

export default function SessionActions({ session }: { session: Session }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function toggleStatus() {
    setLoading(true)
    const newStatus = session.status === 'open' ? 'closed' : 'open'

    const { error } = await supabase
      .from('sessions')
      .update({ status: newStatus })
      .eq('id', session.id)

    setLoading(false)

    if (error) {
      toast.error('Failed to update session status')
      return
    }

    toast.success(`Session ${newStatus === 'open' ? 'opened' : 'closed'}`)
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleStatus}
      disabled={loading}
      className="cursor-pointer text-xs"
    >
      {loading ? '…' : session.status === 'open' ? 'Close' : 'Reopen'}
    </Button>
  )
}
