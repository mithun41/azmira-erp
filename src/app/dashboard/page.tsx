'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { api, ENDPOINTS } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#0369a1','#0ea5e9','#38bdf8','#7dd3fc','#bae6fd']

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(ENDPOINTS.dashboard()).then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Projects',   value: data?.total_projects   ?? '—', color: '#0369a1' },
    { label: 'Active Bookings',  value: data?.active_bookings  ?? '—', color: '#0891b2' },
    { label: 'Total Customers',  value: data?.total_customers  ?? '—', color: '#059669' },
    { label: 'Total Collection', value: data?.total_collection ? fmt.currency(data.total_collection) : '—', color: '#7c3aed' },
    { label: 'Pending Receipts', value: data?.pending_receipts ?? '—', color: '#d97706' },
    { label: 'Active Investors', value: data?.active_investors ?? '—', color: '#db2777' },
    { label: 'Total Plots',      value: data?.total_plots      ?? '—', color: '#0369a1' },
    { label: 'Available Plots',  value: data?.available_plots  ?? '—', color: '#059669' },
  ]

  return (
    <AppShell>
      <h1 className="page-title" style={{ marginBottom: 24 }}>Dashboard</h1>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="value" style={{ color: s.color }}>{s.value}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Monthly Collections</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.monthly_collections || []}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => fmt.currency(v)} />
              <Bar dataKey="amount" fill="#0369a1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Plot Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={data?.plot_status || [{ name:'Available',value:1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label>
                {(data?.plot_status || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Recent Bookings</div>
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead><tr><th style={{ textAlign:'left', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Customer</th><th style={{ textAlign:'left', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Plot</th><th style={{ textAlign:'right', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Amount</th></tr></thead>
            <tbody>
              {(data?.recent_bookings || []).map((b: any) => (
                <tr key={b.id}><td style={{ paddingBottom: 8 }}>{b.customer_name}</td><td>{b.plot_number}</td><td style={{ textAlign:'right' }}>{fmt.currency(b.final_price)}</td></tr>
              ))}
              {!data?.recent_bookings?.length && <tr><td colSpan={3} style={{ textAlign:'center', color:'#94a3b8', padding:'20px 0' }}>No recent bookings</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Upcoming Installments</div>
          <table style={{ width: '100%', fontSize: 13 }}>
            <thead><tr><th style={{ textAlign:'left', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Customer</th><th style={{ textAlign:'left', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Due Date</th><th style={{ textAlign:'right', paddingBottom: 8, color: '#64748b', fontWeight: 600 }}>Amount</th></tr></thead>
            <tbody>
              {(data?.upcoming_installments || []).map((i: any) => (
                <tr key={i.id}><td style={{ paddingBottom: 8 }}>{i.customer_name}</td><td>{fmt.date(i.due_date)}</td><td style={{ textAlign:'right' }}>{fmt.currency(i.amount)}</td></tr>
              ))}
              {!data?.upcoming_installments?.length && <tr><td colSpan={3} style={{ textAlign:'center', color:'#94a3b8', padding:'20px 0' }}>No upcoming</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
