'use client'
import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface Props { title: string; onClose: () => void; children: React.ReactNode; size?: 'md'|'lg' }
export default function Modal({ title, onClose, children, size = 'md' }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><FiX size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
