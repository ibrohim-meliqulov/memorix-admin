'use client'

// app/admin/payments/page.tsx

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken, getAdminToken, PaymentRequest, PaymentStatus } from '@/lib/api'

const STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: '⏳ Kutilmoqda',
  APPROVED: '✅ Tasdiqlandi',
  REJECTED: '❌ Rad etildi',
}

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [filter, setFilter] = useState<PaymentStatus | 'ALL'>('PENDING')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter === 'ALL'
        ? '/payment/admin/requests'
        : `/payment/admin/requests?status=${filter}`
      const data = await adminFetch(url)
      setRequests(data)
    } catch (err: any) {
      if (err.status === 401 || err.status === 403) {
        clearAdminToken()
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [filter, router])

  // ─── AUTH TEKSHIRISH ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!getAdminToken()) {
      router.push('/login')
      return
    }
    setAuthChecked(true)
  }, [router])

  useEffect(() => {
    if (authChecked) fetchRequests()
  }, [authChecked, fetchRequests])

  async function handleApprove(id: number) {
    if (!confirm('Tasdiqlaysizmi? Userga plan beriladi.')) return
    setActionLoading(id)
    try {
      await adminFetch(`/payment/admin/approve/${id}`, { method: 'PATCH' })
      fetchRequests()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id: number) {
    const reason = prompt('Rad etish sababi (ixtiyoriy):')
    if (reason === null) return
    setActionLoading(id)
    try {
      await adminFetch(`/payment/admin/reject/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      })
      fetchRequests()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  function handleLogout() {
    clearAdminToken()
    router.push('/login')
  }

  if (!authChecked) return null

  const filters: (PaymentStatus | 'ALL')[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">To'lov so'rovlari</h1>
            <p className="text-gray-500 text-sm mt-1">Foydalanuvchilarning plan so'rovlarini boshqaring</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Chiqish
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-accent/40'
              }`}
              style={filter === f ? { background: '#6C5CE7' } : undefined}
            >
              {f === 'ALL' ? 'Barchasi' : STATUS_LABELS[f as PaymentStatus]}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Yuklanmoqda...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border">
            So'rovlar topilmadi
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-4">

                  {/* Chek rasmi */}
                  <button
                    onClick={() => setSelectedImage(req.checkUrl)}
                    className="shrink-0"
                    title="Rasmni kattalashtirish"
                  >
                    <img
                      src={req.checkUrl}
                      alt="Chek"
                      className="w-20 h-20 object-cover rounded-xl border-2 border-gray-100 hover:border-accent/40 transition-colors"
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {req.user.firstName || req.user.username || req.user.email || `User #${req.user.id}`}
                      </span>
                      <span className="text-xs text-gray-400">#{req.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                        {STATUS_LABELS[req.status]}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-500 space-x-3">
                      {req.user.email && <span>📧 {req.user.email}</span>}
                      {req.user.telegramId && <span>✈️ @{req.user.telegramId}</span>}
                    </div>

                    <div className="mt-2 flex items-center gap-3">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                        {req.plan} PLAN
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(req.createdAt).toLocaleString('uz-UZ')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {req.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        {actionLoading === req.id ? '...' : '✅ Tasdiqlash'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoading === req.id}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-xl transition-colors"
                      >
                        ❌ Rad etish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Chek"
            className="max-w-full max-h-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  )
}
