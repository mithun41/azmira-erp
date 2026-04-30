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

const EMPTY: any = {
  booking_code: '',
  customer: 0,
  plot: 0,
  project: 0,
  marketing_officer: 0,
  booking_date: '',
  total_price: 0,
  discount_amount: 0,
  gift_amount: 0,
  final_price: 0,
  token_amount: 0,
  token_paid_date: '',
  down_payment_amount: 0,
  down_payment_date: '',
  status: '',
  notes: ''
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  // 🔥 ERROR STATE ADDED
  const [error, setError] = useState<any>(null)

  const ep = ENDPOINTS.bookings

  const load = () => {
    setLoading(true)
    setError(null)

    fetchList(ep.list())
      .then(r => setItems(r.data))
      .catch(err => {
        const apiError = err?.response?.data || err.message
        console.log('LOAD ERROR:', apiError)
        setError(apiError)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const f = (k: string) => (e: any) =>
    setForm((p:any) => ({ ...p, [k]: e.target.value }))

  const openAdd  = () => {
    setForm(EMPTY)
    setError(null)
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm(item)
    setError(null)
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  // 🔥 SAVE WITH ERROR HANDLING
  const save = async () => {
    setSaving(true)
    setError(null)

    try {
      if (modal === 'add') {
        await createItem(ep.create(), form)
        toast.success('Created')
      } else {
        await updateItem(ep.detail(selected.id), form)
        toast.success('Updated')
      }

      setModal(null)
      load()

    } catch (err: any) {
      const apiError = err?.response?.data || err.message

      console.log('🔥 SAVE ERROR:', apiError)
      setError(apiError)

      toast.error('Validation Error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete?')) return
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
        title="Bookings"
        subtitle="Booking management"
        onAdd={openAdd}
        addLabel="New Booking"
      />

      {/* 🔥 ERROR DISPLAY (NO UI CHANGE OTHERWISE) */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          fontSize: 13
        }}>
          <strong>API Error:</strong>
          <pre style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="card">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>booking_code</th>
                  <th>customer</th>
                  <th>plot</th>
                  <th>project</th>
                  <th>booking_date</th>
                  <th>final_price</th>
                  <th>total_paid</th>
                  <th>total_due</th>
                  <th>status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.booking_code ?? '—'}</td>
                    <td>{item.customer ?? '—'}</td>
                    <td>{item.plot ?? '—'}</td>
                    <td>{item.project ?? '—'}</td>
                    <td>{item.booking_date ?? '—'}</td>
                    <td>{fmt.currency(item.final_price)}</td>
                    <td>{item.total_paid ?? '—'}</td>
                    <td>{item.total_due ?? '—'}</td>
                    <td><Badge status={String(item.status)} /></td>

                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => openView(item)}
                          style={{ background:'#e0f2fe', color:'#0369a1', border:'none', padding:'4px 8px', borderRadius:6 }}>
                          <FiEye size={13}/>
                        </button>

                        <button onClick={() => openEdit(item)}
                          style={{ background:'#fef9c3', color:'#92400e', border:'none', padding:'4px 8px', borderRadius:6 }}>
                          <FiEdit2 size={13}/>
                        </button>

                        <button onClick={() => remove(item.id)}
                          className="btn-danger"
                          style={{ padding:'4px 8px' }}>
                          <FiTrash2 size={13}/>
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'New Bookings' : 'Edit Bookings'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <div className="modal-body">
            <div className="form-grid">

              <div><label className="label">Booking Code *</label>
                <input className="input" type="text"
                  value={form.booking_code||''}
                  onChange={f('booking_code')} />
              </div>

              <div><label className="label">Customer ID *</label>
                <input className="input" type="number"
                  value={form.customer||''}
                  onChange={f('customer')} />
              </div>

              <div><label className="label">Plot ID *</label>
                <input className="input" type="number"
                  value={form.plot||''}
                  onChange={f('plot')} />
              </div>

              <div><label className="label">Project ID *</label>
                <input className="input" type="number"
                  value={form.project||''}
                  onChange={f('project')} />
              </div>

              <div><label className="label">Marketing Officer ID</label>
                <input className="input" type="number"
                  value={form.marketing_officer||''}
                  onChange={f('marketing_officer')} />
              </div>

              <div><label className="label">Booking Date</label>
                <input className="input" type="date"
                  value={form.booking_date||''}
                  onChange={f('booking_date')} />
              </div>

              <div><label className="label">Total Price</label>
                <input className="input" type="number"
                  value={form.total_price||''}
                  onChange={f('total_price')} />
              </div>

              <div><label className="label">Discount</label>
                <input className="input" type="number"
                  value={form.discount_amount||''}
                  onChange={f('discount_amount')} />
              </div>

              <div><label className="label">Gift Amount</label>
                <input className="input" type="number"
                  value={form.gift_amount||''}
                  onChange={f('gift_amount')} />
              </div>

              <div><label className="label">Final Price *</label>
                <input className="input" type="number"
                  value={form.final_price||''}
                  onChange={f('final_price')} />
              </div>

              <div><label className="label">Token Amount</label>
                <input className="input" type="number"
                  value={form.token_amount||''}
                  onChange={f('token_amount')} />
              </div>

              <div><label className="label">Token Paid Date</label>
                <input className="input" type="date"
                  value={form.token_paid_date||''}
                  onChange={f('token_paid_date')} />
              </div>

              <div><label className="label">Down Payment</label>
                <input className="input" type="number"
                  value={form.down_payment_amount||''}
                  onChange={f('down_payment_amount')} />
              </div>

              <div><label className="label">Down Payment Date</label>
                <input className="input" type="date"
                  value={form.down_payment_date||''}
                  onChange={f('down_payment_date')} />
              </div>

              <div><label className="label">Status</label>
                <select className="input"
                  value={form.status||''}
                  onChange={f('status')}>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="agreement_done">agreement done</option>
                  <option value="registration_done">registration done</option>
                  <option value="cancelled">cancelled</option>
                  <option value="transferred">transferred</option>
                </select>
              </div>

              <div className="full">
                <label className="label">Notes</label>
                <textarea className="input"
                  rows={2}
                  value={form.notes||''}
                  onChange={f('notes')} />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* ================= VIEW ================= */}
      {modal === 'view' && selected && (
        <Modal title="Bookings Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected)
                .filter(([k]) => !['created_at','updated_at'].includes(k))
                .map(([k,v]) => (
                  <div key={k}>
                    <div className="label">{k.replace(/_/g,' ')}</div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{String(v) || '—'}</div>
                  </div>
                ))}
            </div>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}