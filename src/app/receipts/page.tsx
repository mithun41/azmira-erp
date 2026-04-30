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

const EMPTY: any = {receipt_number: '', booking: 0, customer: 0, installment: 0, receipt_type: '', amount: 0, payment_date: '', payment_mode: '', bank_name: '', cheque_number: '', cheque_date: '', transaction_id: '', cheque_deposit_date: '', status: '', notes: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.receipts
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
      <PageHeader title="Money Receipts" subtitle="Payment receipts (Pending → Complete → Authorized)" onAdd={openAdd} addLabel="New Receipt" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>receipt_number</th><th>customer</th><th>booking</th><th>receipt_type</th><th>amount</th><th>payment_date</th><th>payment_mode</th><th>status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.receipt_number ?? '—'}</td><td>{item.customer ?? '—'}</td><td>{item.booking ?? '—'}</td><td>{item.receipt_type ?? '—'}</td><td>{fmt.currency(item.amount)}</td><td>{fmt.date(item.payment_date)}</td><td>{item.payment_mode ?? '—'}</td><td><Badge status={String(item.status)} /></td>
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
        <Modal title={modal === 'add' ? 'New Money Receipts' : 'Edit Money Receipts'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Receipt Number *</label><input className="input" type="text" value={form.receipt_number||''} onChange={f('receipt_number')} /></div>
              <div><label className="label">Booking ID *</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Customer ID *</label><input className="input" type="number" value={form.customer||''} onChange={f('customer')} /></div>
              <div><label className="label">Installment ID</label><input className="input" type="number" value={form.installment||''} onChange={f('installment')} /></div>
              <div><label className="label">Type</label><select className="input" value={form.receipt_type||''} onChange={f('receipt_type')}><option key='token' value='token'>token</option><option key='down_payment' value='down_payment'>down payment</option><option key='installment' value='installment'>installment</option><option key='full_payment' value='full_payment'>full payment</option><option key='other' value='other'>other</option></select></div>
              <div><label className="label">Amount *</label><input className="input" type="number" value={form.amount||''} onChange={f('amount')} /></div>
              <div><label className="label">Payment Date</label><input className="input" type="date" value={form.payment_date||''} onChange={f('payment_date')} /></div>
              <div><label className="label">Payment Mode</label><select className="input" value={form.payment_mode||''} onChange={f('payment_mode')}><option key='cash' value='cash'>cash</option><option key='bank_transfer' value='bank_transfer'>bank transfer</option><option key='cheque' value='cheque'>cheque</option><option key='mobile_banking' value='mobile_banking'>mobile banking</option><option key='online' value='online'>online</option></select></div>
              <div><label className="label">Bank Name</label><input className="input" type="text" value={form.bank_name||''} onChange={f('bank_name')} /></div>
              <div><label className="label">Cheque Number</label><input className="input" type="text" value={form.cheque_number||''} onChange={f('cheque_number')} /></div>
              <div><label className="label">Cheque Date</label><input className="input" type="date" value={form.cheque_date||''} onChange={f('cheque_date')} /></div>
              <div><label className="label">Transaction ID</label><input className="input" type="text" value={form.transaction_id||''} onChange={f('transaction_id')} /></div>
              <div><label className="label">Cheque Deposit Date</label><input className="input" type="date" value={form.cheque_deposit_date||''} onChange={f('cheque_deposit_date')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.status||''} onChange={f('status')}><option key='pending' value='pending'>pending</option><option key='complete' value='complete'>complete</option><option key='authorized' value='authorized'>authorized</option><option key='rejected' value='rejected'>rejected</option></select></div>
              <div className="full"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={f('notes')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Money Receipts Details" onClose={() => setModal(null)} size="lg">
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
