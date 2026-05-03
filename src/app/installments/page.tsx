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

// জেনারেশনের জন্য প্রয়োজনীয় ৩টি ফিল্ড
const GEN_EMPTY = { booking_id: '', number_of_installments: '', start_date: '' }

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form, setForm] = useState<any>(GEN_EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // API Endpoint Object
  const ep = ENDPOINTS.installments

  // এপিআই কল করে লিস্ট লোড করা
  const load = () => { 
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load installments'))
      .finally(() => setLoading(false)) 
  }

  useEffect(() => { load() }, [])

  const f = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { 
    setForm(GEN_EMPTY)
    setModal('add') 
  }

  const openEdit = (item: any) => { 
    setSelected(item)
    // এডিট এর সময় ব্যাকএন্ডের রিলেশন অনুযায়ী শুধু পেইড অ্যামাউন্ট ও নোটস আপডেট করা হবে
    setForm({
      paid_amount: item.paid_amount,
      notes: item.notes || ''
    })
    setModal('edit') 
  }

  const openView = (item: any) => { setSelected(item); setModal('view') }

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') {
        /** 
         * যেহেতু এটি একটি স্পেশাল জেনারেট ভিউ, 
         * আপনার ENDPOINTS.installments ফাইলে যদি 'generate' কী থাকে তবে সেটি ব্যবহার করবেন।
         * না থাকলে create() মেথডটিই ব্যবহার করা হলো।
         */
        await createItem(ep.create(), form)
        toast.success('Schedule Generated')
      } else {
        // এপিআই কল করে স্পেসিফিক আইডি আপডেট করা
        await updateItem(ep.detail(selected.id), form)
        toast.success('Updated')
      }
      setModal(null)
      load()
    } catch (err: any) {
      toast.error('Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this record?')) return
    try {
      await deleteItem(ep.detail(id))
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <AppShell>
      <PageHeader 
        title="Installment Plans" 
        subtitle="Manage installment schedules" 
        onAdd={openAdd} 
        addLabel="Generate Schedule" 
      />

      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>Inst. No</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.booking_code}</strong><br/>
                    <small className="text-muted">{item.customer_name}</small>
                  </td>
                  <td>#{item.installment_number}</td>
                  <td>{fmt.date(item.due_date)}</td>
                  <td>{fmt.currency(item.amount)}</td>
                  <td>{fmt.currency(item.paid_amount)}</td>
                  <td style={{ color: Number(item.due_amount) > 0 ? '#ef4444' : '#10b981' }}>
                    {fmt.currency(item.due_amount)}
                  </td>
                  <td>
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <Badge status={item.is_paid ? "active" : "cancelled"} />
    <span>{item.is_paid ? "Paid" : "Unpaid"}</span>
  </div>
</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openView(item)} className="btn-icon" style={{ background:'#e0f2fe', color:'#0369a1' }}><FiEye size={13}/></button>
                      <button onClick={() => openEdit(item)} className="btn-icon" style={{ background:'#fef9c3', color:'#92400e' }}><FiEdit2 size={13}/></button>
                      <button onClick={() => remove(item.id)} className="btn-icon btn-danger"><FiTrash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / GENERATE MODAL */}
      {modal === 'add' && (
        <Modal title="Generate New Schedule" onClose={() => setModal(null)} size="md">
          <div className="modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div><label className="label">Booking ID *</label><input className="input" type="number" value={form.booking_id} onChange={f('booking_id')} /></div>
              <div><label className="label">Total Installments *</label><input className="input" type="number" value={form.number_of_installments} onChange={f('number_of_installments')} /></div>
              <div><label className="label">Starting Date *</label><input className="input" type="date" value={form.start_date} onChange={f('start_date')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Generating...' : 'Generate'}</button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {modal === 'edit' && selected && (
        <Modal title={`Update Payment: ${selected.booking_code}`} onClose={() => setModal(null)} size="md">
          <div className="modal-body">
            <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div><label className="label">Paid Amount</label><input className="input" type="number" value={form.paid_amount} onChange={f('paid_amount')} /></div>
              <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={f('notes')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Update'}</button>
          </div>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {modal === 'view' && selected && (
        <Modal title="Installment Plan Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).filter(([k]) => !['created_at','updated_at'].includes(k)).map(([k,v]) => (
                <div key={k}>
                  <div className="label">{k.replace(/_/g,' ')}</div>
                  <div style={{ fontSize:14, fontWeight:500 }}>
                    {k.includes('amount') ? fmt.currency(v as any) : String(v) || '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}