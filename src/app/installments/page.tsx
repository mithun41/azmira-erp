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

type ModalType = 'add' | 'edit' | 'view' | null

type FormType = {
  booking: string
  number_of_installments: string | number
  start_date: string
  paid_amount?: string | number
  notes?: string
}

const GEN_EMPTY: FormType = {
  booking: '',
  number_of_installments: '',
  start_date: ''
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const [modal, setModal] = useState<ModalType>(null)
  const [form, setForm] = useState<FormType>(GEN_EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState<boolean>(false)

  const ep = ENDPOINTS.installments

  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }

  const loadBookings = () => {
    fetchList(ENDPOINTS.bookings.list())
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings'))
  }

  useEffect(() => {
    load()
    loadBookings()
  }, [])

  const f =
    (k: keyof FormType) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm(GEN_EMPTY)
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm(prev => ({
      ...prev,
      paid_amount: item.paid_amount || 0,
      notes: item.notes || ''
    }))
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)

    try {
      if (modal === 'add') {
        await createItem(ep.create(), {
          booking_code: form.booking,
          number_of_installments: Number(form.number_of_installments),
          start_date: form.start_date
        })
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
    } catch {
      toast.error('Failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
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
                      <strong>{item.booking_code}</strong><br />
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

      {/* VIEW MODAL */}
      {modal === 'view' && selected && (
        <Modal title="Installment Details" onClose={() => setModal(null)} size="lg">
          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>
              <p className="text-gray-500">Booking</p>
              <p className="font-semibold">{selected.booking_code}</p>
            </div>

            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-semibold">{selected.customer_name}</p>
            </div>

            <div>
              <p className="text-gray-500">Installment No</p>
              <p className="font-semibold">#{selected.installment_number}</p>
            </div>

            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-semibold">{fmt.date(selected.due_date)}</p>
            </div>

            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-semibold">{fmt.currency(selected.amount)}</p>
            </div>

            <div>
              <p className="text-gray-500">Paid</p>
              <p className="font-semibold">{fmt.currency(selected.paid_amount)}</p>
            </div>

            <div>
              <p className="text-gray-500">Due</p>
              <p className="font-semibold">{fmt.currency(selected.due_amount)}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <Badge status={selected.is_paid ? 'active' : 'pending'} />
            </div>

            {selected.notes && (
              <div className="col-span-2">
                <p className="text-gray-500">Notes</p>
                <p className="font-medium">{selected.notes}</p>
              </div>
            )}

          </div>
        </Modal>
      )}
{modal === 'add' && ( <Modal title="Generate Installments" onClose={() => setModal(null)}> <div className="modal-body"> <div className="form-grid"> <div> <label className="label">Booking *</label> <select className="input" value={form.booking} onChange={f('booking')}> <option value="">Select Booking</option> {bookings.map((b: any) => ( <option key={b.id} value={b.booking_code}> {b.booking_code} - {b.customer} </option> ))} </select> </div> <div> <label className="label">Number of Installments *</label> <input className="input" type="number" value={form.number_of_installments} onChange={f('number_of_installments')} /> </div> <div> <label className="label">Start Date *</label> <input className="input" type="date" value={form.start_date} onChange={f('start_date')} /> </div> </div> </div> <div className="modal-footer"> <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button> <button className="btn-primary" onClick={save} disabled={saving}> {saving ? 'Generating...' : 'Generate'} </button> </div> </Modal> )} {/* ---------------- EDIT MODAL ---------------- */} {modal === 'edit' && selected && ( <Modal title="Update Installment" onClose={() => setModal(null)}> <div className="modal-body"> <div className="form-grid"> <div> <label className="label">Paid Amount</label> <input className="input" type="number" value={form.paid_amount || ''} onChange={f('paid_amount')} /> </div> <div> <label className="label">Notes</label> <textarea className="input" value={form.notes || ''} onChange={f('notes')} /> </div> </div> </div> <div className="modal-footer"> <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button> <button className="btn-primary" onClick={save} disabled={saving}> {saving ? 'Saving...' : 'Update'} </button> </div> </Modal> )}
{/* ---------------- VIEW MODAL ---------------- */}
{modal === 'view' && selected && (
  <Modal
    title={`Installment #${selected.installment_number} Details`}
    onClose={() => setModal(null)}
    size="lg"
  >
    <div className="modal-body">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}
      >
        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Booking Code</p>
          <h3 className="text-lg font-semibold">{selected.booking_code}</h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Customer</p>
          <h3 className="text-lg font-semibold">
            {selected.customer_name || 'N/A'}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Installment Number</p>
          <h3 className="text-lg font-semibold">
            #{selected.installment_number}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Due Date</p>
          <h3 className="text-lg font-semibold">
            {fmt.date(selected.due_date)}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Installment Amount</p>
          <h3 className="text-lg font-semibold text-blue-600">
            {fmt.currency(selected.amount)}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Paid Amount</p>
          <h3 className="text-lg font-semibold text-green-600">
            {fmt.currency(selected.paid_amount)}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500">Due Amount</p>
          <h3
            className={`text-lg font-semibold ${
              Number(selected.due_amount) > 0
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {fmt.currency(selected.due_amount)}
          </h3>
        </div>

        <div className="erp-card p-4">
          <p className="text-sm text-gray-500 mb-2">Payment Status</p>
          <Badge status={selected.is_paid ? 'active' : 'pending'} />
        </div>

        <div className="erp-card p-4 col-span-2">
          <p className="text-sm text-gray-500">Notes</p>
          <p className="mt-2">
            {selected.notes || 'No notes available'}
          </p>
        </div>
      </div>
    </div>

    <div className="modal-footer">
      <button
        className="btn-secondary"
        onClick={() => setModal(null)}
      >
        Close
      </button>
    </div>
  </Modal>
)}
    </AppShell>
  )
}