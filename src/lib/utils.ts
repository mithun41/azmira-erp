import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) { return clsx(inputs) }

export const fmt = {
  currency: (n: number | string) => `৳ ${Number(n).toLocaleString('en-BD')}`,
  date: (d: string) => d ? new Date(d).toLocaleDateString('en-BD') : '—',
  datetime: (d: string) => d ? new Date(d).toLocaleString('en-BD') : '—',
  percent: (n: number) => `${n}%`,
}

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  available: 'bg-emerald-100 text-emerald-700',
  booked: 'bg-orange-100 text-orange-700',
  sold: 'bg-gray-100 text-gray-700',
  authorized: 'bg-indigo-100 text-indigo-700',
  generated: 'bg-cyan-100 text-cyan-700',
  default: 'bg-gray-100 text-gray-600',
}

export const badge = (status: string) =>
  `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] || STATUS_COLORS.default}`
