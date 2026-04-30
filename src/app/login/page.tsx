'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api, ENDPOINTS } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

 const { login } = useAuth()

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    await login(form.username, form.password)
    toast.success("Login successful")
    router.push("/dashboard")
  } catch {
    toast.error("Login failed")
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0c1929 0%, #0369a1 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 25px 50px rgba(0,0,0,.25)'
      }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-.02em',
            color: '#0c1929'
          }}>
            RE<span style={{ color: '#0369a1' }}>ERP</span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 6 }}>
            Real Estate Management System
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label className="label">Username</label>
            <input
              className="input"
              placeholder="Enter username"
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              justifyContent: 'center',
              padding: '12px'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>
      </div>
    </div>
  )
}