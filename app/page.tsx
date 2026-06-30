'use client'

// app/page.tsx — boshlang'ich redirect

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminToken } from '@/lib/api'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    if (getAdminToken()) {
      router.push('/admin/payments')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-gray-200 border-t-accent rounded-full animate-spin" style={{ borderTopColor: '#6C5CE7' }} />
    </div>
  )
}
