// lib/api.ts
// Admin panel uchun markaziy API yordamchi.
// Token "admin_token" nomi bilan localStorage'da saqlanadi —
// memorix-front (user panel) bilan aralashmasligi uchun alohida kalit.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://memorix-r9gk.onrender.com';

const TOKEN_KEY = 'admin_token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Tokenli fetch. Agar 401/403 qaytsa, xato tashlaydi —
 * sahifa darajasida bu xatoni tutib, login'ga qaytarish kerak.
 */
export async function adminFetch(path: string, opts: RequestInit = {}) {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // FormData yuborilsa Content-Type qo'lda qo'yilmaydi (browser o'zi qo'yadi)
  if (!(opts.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });

  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    const err: any = new Error(data.message || 'Ruxsat yo\'q');
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Xatolik yuz berdi');
  }
  return data;
}

// ─── TYPES ────────────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Plan = 'FREE' | 'STARTER' | 'PRO' | 'B2B';

export interface PaymentRequest {
  id: number;
  plan: Plan;
  status: PaymentStatus;
  checkUrl: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    email?: string;
    username?: string;
    firstName?: string;
    telegramId?: string;
  };
}
