'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { useAuth } from '@/lib/auth'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push('/login')
  //   }
  // }, [user, loading, router])

  if (loading) return null

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: 'var(--sidebar-w)',
          flex: 1,
          minHeight: '100vh',
          padding: '28px',
          background: 'var(--bg)',
        }}
      >
        {children}
      </main>
    </div>
  )
}