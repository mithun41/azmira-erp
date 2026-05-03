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

const GEN_EMPTY = {
  booking: '',
  number_of_installments: '',
  start_date: ''
}

export default function Page() {
  const [items, setItems] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(GEN_EMPTY)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.installments

  // ---------------- LOAD INSTALLMENTS ----------------
  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  // ---------------- LOAD BOOKINGS ----------------
  const loadBookings = () => {
    fetchList(ENDPOINTS.bookings.list())
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings'))
  }

  useEffect(() => {
    load()
    loadBookings()
  }, [])

  const f = (k) => (e) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm(GEN_EMPTY)
    setModal('add')
  }

  const openEdit = (item) => {
    setSelected(item)
    setForm({
      paid_amount: item.paid_amount || 0,
      notes: item.notes || ''
    })
    setModal('edit')
  }

  const openView = (item) => {
    setSelected(item)
    setModal('view')
  }

  // ---------------- SAVE ----------------
  const save = async () => {
    setSaving(true)

    try {
      if (modal === 'add') {
        const payload = {
          booking_code: form.booking,   // 🔥 your requirement
          number_of_installments: Number(form.number_of_installments),
          start_date: form.start_date
        }

        await createItem(ep.create(), payload)
        toast.success('Installments generated')
      } else {
        await updateItem(ep.detail(selected.id), {
          paid_amount: Number(form.paid_amount),
          notes: form.notes
        })
        toast.success('Updated')
      }

      setModal(null)
      load()

    } catch (err) {
      console.log(err?.response?.data || err.message)
      toast.error('Failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete?')) return
    await deleteItem(ep.detail(id))
    toast.success('Deleted')
    load()
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
                  <th>Inst</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.booking_code}</strong>
                      <br />
                      <small>{item.customer_name}</small>
                    </td>

                    <td>#{item.installment_number}</td>
                    <td>{fmt.date(item.due_date)}</td>
                    <td>{fmt.currency(item.amount)}</td>
                    <td>{fmt.currency(item.paid_amount)}</td>

                    <td style={{ color: Number(item.due_amount) > 0 ? '#dc2626' : '#16a34a' }}>
                      {fmt.currency(item.due_amount)}
                    </td>

                    <td>
                      <Badge status={item.is_paid ? 'active' : 'pending'} />
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openView(item)}><FiEye /></button>
                        <button onClick={() => openEdit(item)}><FiEdit2 /></button>
                        <button onClick={() => remove(item.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

      {/* ---------------- ADD MODAL ---------------- */}
      {modal === 'add' && (
        <Modal title="Generate Installments" onClose={() => setModal(null)}>
          <div className="modal-body">

            <div className="form-grid">

              {/* BOOKING SELECT */}
              <div>
                <label className="label">Booking *</label>
                <select
                  className="input"
                  value={form.booking}
                  onChange={f('booking')}
                >
                  <option value="">Select Booking</option>
                  {bookings.map(b => (
                    <option key={b.id} value={b.booking_code}>
                      {b.booking_code} - {b.customer}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Number of Installments *</label>
                <input
                  className="input"
                  type="number"
                  value={form.number_of_installments}
                  onChange={f('number_of_installments')}
                />
              </div>

              <div>
                <label className="label">Start Date *</label>
                <input
                  className="input"
                  type="date"
                  value={form.start_date}
                  onChange={f('start_date')}
                />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </Modal>
      )}

      {/* ---------------- EDIT MODAL ---------------- */}
      {modal === 'edit' && selected && (
        <Modal title="Update Installment" onClose={() => setModal(null)}>
          <div className="modal-body">

            <div className="form-grid">

              <div>
                <label className="label">Paid Amount</label>
                <input
                  className="input"
                  type="number"
                  value={form.paid_amount}
                  onChange={f('paid_amount')}
                />
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  value={form.notes}
                  onChange={f('notes')}
                />
              </div>

            </div>

          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}