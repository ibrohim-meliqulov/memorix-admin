'use client'

// app/admin/stats/page.tsx
// Ro'yxatdan o'tgan userlar soni + Free/Starter/Premium foizli taqsimot

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminToken } from '@/lib/api'

// ⚠️ MOSLANG: loyihangizdagi haqiqiy API bazaviy manzili bilan
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'https://api.memorix.uz'

interface PlanStat {
    count: number
    percent: number
}

interface AdminStats {
    total: number
    byPlan: {
        free: PlanStat
        starter: PlanStat
        pro: PlanStat
        b2b: PlanStat
    }
}

const PLAN_META = {
    free: { label: 'Free', color: '#94a3b8' },
    starter: { label: 'Starter', color: '#3b82f6' },
    pro: { label: 'Premium', color: '#6C5CE7' },
    b2b: { label: 'B2B', color: '#10b981' },
} as const

export default function AdminStatsPage() {
    const router = useRouter()
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const token = getAdminToken()
        if (!token) {
            router.push('/login')
            return
        }

        fetch(`${API_BASE}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(`Xatolik: ${res.status}`)
                return res.json()
            })
            .then((data: AdminStats) => setStats(data))
            .catch((err) => setError(err.message ?? "Ma'lumot olinmadi"))
            .finally(() => setLoading(false))
    }, [router])

    return (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>
                Foydalanuvchilar statistikasi
            </h1>

            {loading && (
                <div
                    className="w-8 h-8 border-3 border-gray-200 rounded-full animate-spin"
                    style={{ borderTopColor: '#6C5CE7' }}
                />
            )}

            {error && (
                <div style={{ color: '#ef4444', fontSize: 14 }}>{error}</div>
            )}

            {stats && (
                <>
                    {/* Jami sondagi katta karta */}
                    <div
                        style={{
                            background: 'white',
                            border: '1px solid rgba(108,92,231,0.15)',
                            borderRadius: 18,
                            padding: '24px 28px',
                            marginBottom: 20,
                        }}
                    >
                        <div style={{ fontSize: 13, color: 'rgba(30,27,75,0.55)', marginBottom: 6 }}>
                            Jami ro'yxatdan o'tgan userlar
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 800 }}>{stats.total}</div>
                    </div>

                    {/* Plan bo'yicha taqsimot */}
                    <div
                        style={{
                            background: 'white',
                            border: '1px solid rgba(108,92,231,0.15)',
                            borderRadius: 18,
                            padding: '24px 28px',
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>
                            Reja bo'yicha taqsimot
                        </div>

                        {(Object.keys(PLAN_META) as Array<keyof typeof PLAN_META>).map((key) => {
                            const meta = PLAN_META[key]
                            const data = stats.byPlan[key]
                            return (
                                <div key={key} style={{ marginBottom: 16 }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 13,
                                            marginBottom: 6,
                                        }}
                                    >
                                        <span style={{ fontWeight: 600 }}>{meta.label}</span>
                                        <span style={{ color: 'rgba(30,27,75,0.6)' }}>
                                            {data.count} ta &middot; {data.percent}%
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            background: 'rgba(108,92,231,0.08)',
                                            borderRadius: 8,
                                            height: 10,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${data.percent}%`,
                                                height: '100%',
                                                background: meta.color,
                                                borderRadius: 8,
                                                transition: 'width 0.3s ease',
                                            }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}