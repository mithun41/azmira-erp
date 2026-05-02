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

const EMPTY = {
  booking_code: '',
  customer: '',
  plot: '',
  project: '',
  marketing_officer: '',
  transferred_to: '',
  booking_date: '',
  total_price: 0,
  discount_amount: 0,
  final_price: 0,
  token_amount: 0,
  token_paid_date: '',
  down_payment_amount: 0,
  down_payment_date: '',
  status: 'pending',
  notes: ''
}

export default function Page() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // dropdown data
  const [customers, setCustomers] = useState([])
  const [plots, setPlots] = useState([])
  const [projects, setProjects] = useState([])
  const [officers, setOfficers] = useState([])

  const ep = ENDPOINTS.bookings

  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    fetchList(ENDPOINTS.customers.list()).then(r => setCustomers(r.data))
    fetchList(ENDPOINTS.plots.list()).then(r => setPlots(r.data))
    fetchList(ENDPOINTS.projects.list()).then(r => setProjects(r.data))
    fetchList(ENDPOINTS.officers.list()).then(r => setOfficers(r.data))
  }, [])

  const f = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }))
  }

  const openAdd = () => {
    setForm(EMPTY)
    setError(null)
    setModal('add')
  }

  const openEdit = (item) => {
    setSelected(item);

    const customerId = customers.find(c => c.full_name === item.customer)?.id;
    const plotId = plots.find(p => p.plot_number === item.plot)?.id;
    const projectId = projects.find(p => p.project_name === item.project)?.id;
    const officerId = officers.find(o => o.user?.full_name === item.marketing_officer)?.id;

    setForm({
      ...item,
      customer: customerId ? String(customerId) : '',
      plot: plotId ? String(plotId) : '',
      project: projectId ? String(projectId) : '',
      marketing_officer: officerId ? String(officerId) : (item.marketing_officer_id ? String(item.marketing_officer_id) : ''),
      // নতুন ফিল্ডগুলো ফর্ম স্টেটে নিশ্চিত করা
      down_payment_amount: item.down_payment_amount || 0,
      down_payment_date: item.down_payment_date || '',
    });

    setError(null);
    setModal('edit');
  };

  const openView = (item) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...form,
        customer: Number(form.customer),
        plot: Number(form.plot),
        project: Number(form.project),
        marketing_officer: form.marketing_officer ? Number(form.marketing_officer) : null,
        transferred_to: form.transferred_to ? Number(form.transferred_to) : null,
        total_price: Number(form.total_price),
        discount_amount: Number(form.discount_amount),
        token_amount: Number(form.token_amount),
        down_payment_amount: Number(form.down_payment_amount), // কনভার্সন অ্যাড করা হয়েছে
        final_price: Number(form.total_price) - Number(form.discount_amount)
      }

      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Created Successfully')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Updated Successfully')
      }

      setModal(null)
      load()
    } catch (err) {
      setError(err?.response?.data || err.message)
      toast.error('Failed to save data')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    try {
      await deleteItem(ep.detail(id))
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <AppShell>
      <PageHeader 
        title="Bookings" 
        subtitle="Manage property bookings and payments" 
        onAdd={openAdd} 
        addLabel="New Booking" 
      />

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, marginBottom: 15, borderRadius: 8, fontSize: 13 }}>
          <strong>Error Details:</strong>
          <pre style={{ marginTop: 5, whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}

      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Customer</th>
                  <th>Plot</th>
                  <th>Project</th>
                  <th>Date</th>
                  <th>Final Price</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><span style={{ fontWeight: 600 }}>{item.booking_code}</span></td>
                    <td>{item.customer_name || item.customer}</td>
                    <td>{item.plot_name || item.plot}</td>
                    <td>{item.project_name || item.project}</td>
                    <td>{item.booking_date || '—'}</td>
                    <td>{fmt.currency(item.final_price)}</td>
                    <td style={{ color: Number(item.total_due) > 0 ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
        {fmt.currency(item.total_due)}
      </td>
                    <td><Badge status={item.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => openView(item)} title="View"
                          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiEye size={14} />
                        </button>
                        <button onClick={() => openEdit(item)} title="Edit"
                          style={{ background: '#fef9c3', color: '#92400e', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => remove(item.id)} title="Delete"
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiTrash2 size={14} />
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

      {/* ================= ADD / EDIT MODAL ================= */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Create New Booking' : 'Edit Booking'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div>
                <label className="label">Booking Code</label>
                <input className="input" value={form.booking_code} onChange={f('booking_code')} />
              </div>

              <div>
                <label className="label">Customer</label>
                <select className="input" value={form.customer} onChange={f('customer')}>
                  <option value="">Select Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Plot</label>
                <select className="input" value={form.plot} onChange={f('plot')}>
                  <option value="">Select Plot</option>
                  {plots.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.plot_number}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Project</label>
                <select className="input" value={form.project} onChange={f('project')}>
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={String(p.id)}>{p.project_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Marketing Officer</label>
                <select className="input" value={form.marketing_officer} onChange={f('marketing_officer')}>
                  <option value="">Select Officer</option>
                  {officers.map(o => <option key={o.id} value={String(o.id)}>{o.user?.full_name || o.id}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Booking Date</label>
                <input className="input" type="date" value={form.booking_date} onChange={f('booking_date')} />
              </div>

              <div>
                <label className="label">Total Price</label>
                <input className="input" type="number" value={form.total_price} onChange={f('total_price')} />
              </div>

              <div>
                <label className="label">Discount Amount</label>
                <input className="input" type="number" value={form.discount_amount} onChange={f('discount_amount')} />
              </div>

              <div>
                <label className="label">Token Amount</label>
                <input className="input" type="number" value={form.token_amount} onChange={f('token_amount')} />
              </div>

              <div>
                <label className="label">Token Paid Date</label>
                <input className="input" type="date" value={form.token_paid_date} onChange={f('token_paid_date')} />
              </div>

              {/* 🔥 নতুন ফিল্ডগুলো এখানে যোগ করা হয়েছে */}
              <div>
                <label className="label">Down Payment Amount</label>
                <input className="input" type="number" value={form.down_payment_amount} onChange={f('down_payment_amount')} />
              </div>

              <div>
                <label className="label">Down Payment Date</label>
                <input className="input" type="date" value={form.down_payment_date} onChange={f('down_payment_date')} />
              </div>

              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="agreement_done">Agreement Done</option>
                  <option value="registration_done">Registration Done</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>

              <div className="full">
                <label className="label">Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={f('notes')} />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* ================= VIEW DETAILS MODAL ================= */}
      {modal === 'view' && selected && (
        <Modal title="Booking Detailed View" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([key, val]) => {
                if (['customer_id', 'plot_id', 'project_id', 'marketing_officer_id'].includes(key)) return null;
                
                return (
                  <div key={key} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                    <div className="label" style={{ textTransform: 'capitalize', color: '#6b7280' }}>
                      {key.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      {typeof val === 'number' && key.includes('price') ? fmt.currency(val) : String(val || '—')}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-primary" onClick={() => setModal(null)}>Close</button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}