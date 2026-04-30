'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Empty from '@/components/ui/Empty'
import toast from 'react-hot-toast'
import { fetchList, createItem, updateItem, deleteItem, ENDPOINTS } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

const EMPTY: any = {recipient_phone: '', recipient_name: '', sms_type: '', message: '', customer: 0, booking: 0, status: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.smsLogs
  const load = () => { setLoading(true); fetchList(ep.list()).then(r => setItems(r.data)).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const f = (k: string) => (e: any) => setForm((p:any) => ({ ...p, [k]: e.target.value }))
  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (item: any) => { setSelected(item); setForm(item); setModal('edit') }
  const openView = (item: any) => { setSelected(item); setModal('view') }
  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') { await createItem(ep.create(), form); toast.success('Created') }
      else { await updateItem(ep.detail(selected.id), form); toast.success('Updated') }
      setModal(null); load()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }
  const remove = async (id: number) => {
    if (!confirm('Delete?')) return
    try { await deleteItem(ep.detail(id)); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  return (
    <AppShell>
      <PageHeader title="SMS Logs" subtitle="Notification and SMS history" onAdd={openAdd} addLabel="Send SMS" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>recipient_phone</th><th>recipient_name</th><th>sms_type</th><th>status</th><th>sent_at</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.recipient_phone ?? '—'}</td><td>{item.recipient_name ?? '—'}</td><td>{item.sms_type ?? '—'}</td><td><Badge status={String(item.status)} /></td><td>{item.sent_at ?? '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openView(item)} style={{ background:'#e0f2fe', color:'#0369a1', border:'none', padding:'4px 8px', borderRadius:6, cursor:'pointer' }}><FiEye size={13}/></button>
                      <button onClick={() => openEdit(item)} style={{ background:'#fef9c3', color:'#92400e', border:'none', padding:'4px 8px', borderRadius:6, cursor:'pointer' }}><FiEdit2 size={13}/></button>
                      <button onClick={() => remove(item.id)} className="btn-danger" style={{ padding:'4px 8px' }}><FiTrash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New SMS Logs' : 'Edit SMS Logs'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Phone *</label><input className="input" type="text" value={form.recipient_phone||''} onChange={f('recipient_phone')} /></div>
              <div><label className="label">Recipient Name</label><input className="input" type="text" value={form.recipient_name||''} onChange={f('recipient_name')} /></div>
              <div><label className="label">Type *</label><select className="input" value={form.sms_type||''} onChange={f('sms_type')}><option key='installment_reminder' value='installment_reminder'>installment reminder</option><option key='installment_due' value='installment_due'>installment due</option><option key='payment_received' value='payment_received'>payment received</option><option key='booking_confirmed' value='booking_confirmed'>booking confirmed</option><option key='token_expiry' value='token_expiry'>token expiry</option><option key='cheque_deposit' value='cheque_deposit'>cheque deposit</option><option key='welcome' value='welcome'>welcome</option><option key='offer' value='offer'>offer</option><option key='eid' value='eid'>eid</option><option key='jumar' value='jumar'>jumar</option><option key='pohela_boishakh' value='pohela_boishakh'>pohela boishakh</option><option key='commission' value='commission'>commission</option><option key='admin_notification' value='admin_notification'>admin notification</option><option key='other' value='other'>other</option></select></div>
              <div className="full"><label className="label">Message *</label><textarea className="input" rows={2} value={form.message||''} onChange={f('message')} /></div>
              <div><label className="label">Customer ID</label><input className="input" type="number" value={form.customer||''} onChange={f('customer')} /></div>
              <div><label className="label">Booking ID</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.status||''} onChange={f('status')}><option key='pending' value='pending'>pending</option><option key='sent' value='sent'>sent</option><option key='failed' value='failed'>failed</option></select></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="SMS Logs Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).filter(([k]) => !['created_at','updated_at'].includes(k)).map(([k,v]) => (
                <div key={k}><div className="label">{k.replace(/_/g,' ')}</div><div style={{ fontSize:14, fontWeight:500 }}>{String(v) || '—'}</div></div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
