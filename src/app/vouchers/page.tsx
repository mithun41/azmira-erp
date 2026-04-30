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

const EMPTY: any = {voucher_number: '', voucher_type: '', voucher_date: '', amount: 0, debit_head: '', credit_head: '', booking: 0, customer: 0, status: '', description: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.vouchers
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
      <PageHeader title="Vouchers" subtitle="Debit / Credit / Journal vouchers" onAdd={openAdd} addLabel="New Voucher" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>voucher_number</th><th>voucher_type</th><th>voucher_date</th><th>amount</th><th>debit_head</th><th>credit_head</th><th>status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.voucher_number ?? '—'}</td><td>{item.voucher_type ?? '—'}</td><td>{item.voucher_date ?? '—'}</td><td>{fmt.currency(item.amount)}</td><td>{item.debit_head ?? '—'}</td><td>{item.credit_head ?? '—'}</td><td><Badge status={String(item.status)} /></td>
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
        <Modal title={modal === 'add' ? 'New Vouchers' : 'Edit Vouchers'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Voucher Number *</label><input className="input" type="text" value={form.voucher_number||''} onChange={f('voucher_number')} /></div>
              <div><label className="label">Type *</label><select className="input" value={form.voucher_type||''} onChange={f('voucher_type')}><option key='debit' value='debit'>debit</option><option key='credit' value='credit'>credit</option><option key='journal' value='journal'>journal</option><option key='contra' value='contra'>contra</option></select></div>
              <div><label className="label">Date</label><input className="input" type="date" value={form.voucher_date||''} onChange={f('voucher_date')} /></div>
              <div><label className="label">Amount *</label><input className="input" type="number" value={form.amount||''} onChange={f('amount')} /></div>
              <div><label className="label">Debit Head</label><input className="input" type="text" value={form.debit_head||''} onChange={f('debit_head')} /></div>
              <div><label className="label">Credit Head</label><input className="input" type="text" value={form.credit_head||''} onChange={f('credit_head')} /></div>
              <div><label className="label">Booking ID</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Customer ID</label><input className="input" type="number" value={form.customer||''} onChange={f('customer')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.status||''} onChange={f('status')}><option key='draft' value='draft'>draft</option><option key='approved' value='approved'>approved</option><option key='rejected' value='rejected'>rejected</option></select></div>
              <div className="full"><label className="label">Description</label><textarea className="input" rows={2} value={form.description||''} onChange={f('description')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Vouchers Details" onClose={() => setModal(null)} size="lg">
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
