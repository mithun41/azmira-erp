'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Empty from '@/components/ui/Empty'
import toast from 'react-hot-toast'
import { fetchList, createItem, updateItem, deleteItem, ENDPOINTS, api } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { FiEdit2, FiTrash2, FiEye, FiDownload, FiList } from 'react-icons/fi'
import { generateReceiptPDF } from '@/lib/receipt'

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
  notes: '',
}

export default function BookingsPage() {
  const [items, setItems]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState<'add' | 'edit' | 'view' | 'installments' | 'receipt_list' | null>(null)
  const [selected, setSelected]     = useState<any | null>(null)
  const [form, setForm]             = useState<any>(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<any | null>(null)
  const [receiptLoading, setReceiptLoading] = useState<number | null>(null)

  // dropdown data
  const [customers, setCustomers]   = useState<any[]>([])
  const [plots, setPlots]           = useState<any[]>([])
  const [projects, setProjects]     = useState<any[]>([])
  const [officers, setOfficers]     = useState<any[]>([])

  // installments
  const [installments, setInstallments] = useState<any[]>([])
  const [installLoading, setInstallLoading] = useState(false)

  // receipts list for a booking
  const [receiptList, setReceiptList] = useState<any[]>([])
  const [receiptListLoading, setReceiptListLoading] = useState(false)

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

  const f = (k: string) => (e: any) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => { setForm(EMPTY); setError(null); setModal('add') }

  const openEdit = (item: any) => {
    setSelected(item)
    const customerId = customers.find(c => c.full_name === item.customer)?.id
    const plotId     = plots.find(p => p.plot_number === item.plot)?.id
    const projectId  = projects.find(p => p.project_name === item.project)?.id
    const officerId  = officers.find(o => o.user?.full_name === item.marketing_officer)?.id
    setForm({
      ...item,
      customer:           customerId ? String(customerId) : '',
      plot:               plotId     ? String(plotId)     : '',
      project:            projectId  ? String(projectId)  : '',
      marketing_officer:  officerId  ? String(officerId)  : (item.marketing_officer_id ? String(item.marketing_officer_id) : ''),
      down_payment_amount: item.down_payment_amount || 0,
      down_payment_date:   item.down_payment_date   || '',
    })
    setError(null)
    setModal('edit')
  }

  const openView = (item: any) => { setSelected(item); setModal('view') }

  // ── Installments modal ─────────────────────────────────────
 const openInstallments = async (booking: any) => {
  setSelected(booking)
  setInstallments([])
  setModal('installments')
  setInstallLoading(true)

  try {
    const res = await fetchList(`${ENDPOINTS.installments.list()}`)
    const all = res.data || []

    // 🔥 FRONTEND FILTER (safe fallback)
    const filtered = all.filter(
      (ins: any) =>
        String(ins.booking) === String(booking.id) ||
        String(ins.booking_id) === String(booking.id)
    )

    setInstallments(filtered)
  } catch {
    toast.error('Could not load installments')
  } finally {
    setInstallLoading(false)
  }
}

  // ── Receipts list modal ────────────────────────────────────
  const openReceiptList = async (booking: any) => {
    setSelected(booking)
    setReceiptList([])
    setModal('receipt_list')
    setReceiptListLoading(true)
    try {
      const res = await fetchList(`${ENDPOINTS.receipts.list()}?booking=${booking.id}`)
      setReceiptList(res.data || [])
    } catch {
      toast.error('Could not load receipts')
    } finally {
      setReceiptListLoading(false)
    }
  }

  // ── Save booking ───────────────────────────────────────────
  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...form,
        customer:           Number(form.customer),
        plot:               Number(form.plot),
        project:            Number(form.project),
        marketing_officer:  form.marketing_officer  ? Number(form.marketing_officer)  : null,
        transferred_to:     form.transferred_to     ? Number(form.transferred_to)     : null,
        total_price:        Number(form.total_price),
        discount_amount:    Number(form.discount_amount),
        token_amount:       Number(form.token_amount),
        down_payment_amount: Number(form.down_payment_amount),
        final_price:        Number(form.total_price) - Number(form.discount_amount),
      }
      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Booking created')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Booking updated')
      }
      setModal(null); load()
    } catch (err: any) {
      setError(err?.response?.data || err.message)
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: any) => {
    if (!confirm('Delete this booking?')) return
    try { await deleteItem(ep.detail(id)); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
  }

  // ── Download receipt PDF ───────────────────────────────────
  const handleDownloadReceipt = async (booking: any, receiptOverride?: any) => {
    setReceiptLoading(booking.id)
    try {
      // 1. Get receipt — use override (from receipt_list modal) or fetch latest
      let receipt = receiptOverride
      if (!receipt) {
        const receiptRes = await fetchList(`${ENDPOINTS.receipts.list()}?booking=${booking.id}`)
        const list = receiptRes.data || []
        if (list.length === 0) { toast.error('No receipt found for this booking'); return }
        // use latest authorized receipt, else latest
        receipt = list.find((r: any) => r.status === 'authorized') || list[list.length - 1]
      }

      // 2. Full booking data
      const bookingRes = await api.get(ep.detail(booking.id))
      const fullBooking = bookingRes.data || booking

      // 3. Plot details
      let plot = null
      const plotId = fullBooking.plot_id || (plots.find(p => p.plot_number === fullBooking.plot)?.id)
      if (plotId) {
        try { const pr = await api.get(ENDPOINTS.plots.detail(plotId)); plot = pr.data } catch {}
      }
      if (!plot) {
        plot = plots.find(p => p.plot_number === fullBooking.plot) || null
      }

      // 4. Customer details
      let customer = null
      const custId = receipt?.customer || fullBooking.customer_id
      if (custId) {
        try { const cr = await api.get(ENDPOINTS.customers.detail(Number(custId))); customer = cr.data } catch {}
      }
      if (!customer) {
        customer = customers.find(c => c.full_name === fullBooking.customer) || null
      }

      // 5. Installment linked to this receipt
      let installment = null
      if (receipt?.installment) {
        try {
          const ir = await api.get(ENDPOINTS.installments.detail(receipt.installment))
          installment = ir.data
        } catch {}
      }

      // 6. Generate PDF
      generateReceiptPDF({ booking: fullBooking, receipt, plot, installment, customer })
      toast.success('Receipt downloaded')

    } catch (err) {
      console.error(err)
      toast.error('Receipt download failed')
    } finally {
      setReceiptLoading(null)
    }
  }

  // ── JSX ────────────────────────────────────────────────────
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
          <strong>Error:</strong>
          <pre style={{ marginTop: 5, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(error, null, 2)}</pre>
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
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td><span style={{ fontWeight: 600, color: '#0369a1' }}>{item.booking_code}</span></td>
                    <td>{item.customer_name || item.customer}</td>
                    <td>{item.plot_number || item.plot}</td>
                    <td>{item.project_name || item.project}</td>
                    <td>{fmt.date(item.booking_date)}</td>
                    <td style={{ fontWeight: 600 }}>{fmt.currency(item.final_price)}</td>
                    <td style={{ color: '#16a34a', fontWeight: 500 }}>{fmt.currency(item.total_paid)}</td>
                    <td style={{ color: Number(item.total_due) > 0 ? '#dc2626' : '#16a34a', fontWeight: 500 }}>
                      {fmt.currency(item.total_due)}
                    </td>
                    <td><Badge status={item.status} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* View */}
                        <button onClick={() => openView(item)} title="View"
                          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 7px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiEye size={13} />
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(item)} title="Edit"
                          style={{ background: '#fef9c3', color: '#92400e', border: 'none', padding: '5px 7px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiEdit2 size={13} />
                        </button>
                        {/* Installments */}
                        <button onClick={() => openInstallments(item)} title="Installments"
                          style={{ background: '#d1fae5', color: '#065f46', border: 'none', padding: '5px 9px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                          <FiList size={13} />
                        </button>
                        {/* Receipts list */}
                        <button onClick={() => openReceiptList(item)} title="Receipts"
                          style={{ background: '#ede9fe', color: '#5b21b6', border: 'none', padding: '5px 9px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                          Receipts
                        </button>
                        {/* Download latest receipt */}
                        <button
                          onClick={() => handleDownloadReceipt(item)}
                          title="Download Receipt PDF"
                          disabled={receiptLoading === item.id}
                          style={{ background: '#fce7f3', color: '#9d174d', border: 'none', padding: '5px 7px', borderRadius: 6, cursor: 'pointer' }}>
                          {receiptLoading === item.id
                            ? <span style={{ fontSize: 11 }}>...</span>
                            : <FiDownload size={13} />}
                        </button>
                        {/* Delete */}
                        <button onClick={() => remove(item.id)} title="Delete"
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '5px 7px', borderRadius: 6, cursor: 'pointer' }}>
                          <FiTrash2 size={13} />
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

      {/* ── ADD / EDIT MODAL ─────────────────────────────────── */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Booking' : 'Edit Booking'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div>
                <label className="label">Booking Code *</label>
                <input className="input" value={form.booking_code} onChange={f('booking_code')} />
              </div>
              <div>
                <label className="label">Customer *</label>
                <select className="input" value={form.customer} onChange={f('customer')}>
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={String(c.id)}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Plot *</label>
                <select className="input" value={form.plot} onChange={f('plot')}>
                  <option value="">Select Plot</option>
                  {plots.map(p => <option key={p.id} value={String(p.id)}>{p.plot_number} — {p.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Project *</label>
                <select className="input" value={form.project} onChange={f('project')}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={String(p.id)}>{p.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Marketing Officer</label>
                <select className="input" value={form.marketing_officer} onChange={f('marketing_officer')}>
                  <option value="">Select Officer</option>
                  {officers.map(o => <option key={o.id} value={String(o.id)}>{o.user?.full_name || `Officer #${o.id}`}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Booking Date</label>
                <input className="input" type="date" value={form.booking_date} onChange={f('booking_date')} />
              </div>
              <div>
                <label className="label">Total Price (৳)</label>
                <input className="input" type="number" value={form.total_price} onChange={f('total_price')} />
              </div>
              <div>
                <label className="label">Discount Amount (৳)</label>
                <input className="input" type="number" value={form.discount_amount} onChange={f('discount_amount')} />
              </div>
              <div>
                <label className="label">Token Amount (৳)</label>
                <input className="input" type="number" value={form.token_amount} onChange={f('token_amount')} />
              </div>
              <div>
                <label className="label">Token Paid Date</label>
                <input className="input" type="date" value={form.token_paid_date} onChange={f('token_paid_date')} />
              </div>
              <div>
                <label className="label">Down Payment (৳)</label>
                <input className="input" type="number" value={form.down_payment_amount} onChange={f('down_payment_amount')} />
              </div>
              <div>
                <label className="label">Down Payment Date</label>
                <input className="input" type="date" value={form.down_payment_date} onChange={f('down_payment_date')} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  {['pending', 'confirmed', 'agreement_done', 'registration_done', 'cancelled', 'transferred'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
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
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── VIEW MODAL ───────────────────────────────────────── */}
      {modal === 'view' && selected && (
        <Modal title="Booking Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Booking Code', selected.booking_code],
                ['Customer', selected.customer_name || selected.customer],
                ['Plot', selected.plot_number || selected.plot],
                ['Project', selected.project_name || selected.project],
                ['Booking Date', fmt.date(selected.booking_date)],
                ['Status', selected.status],
                ['Total Price', fmt.currency(selected.total_price)],
                ['Discount', fmt.currency(selected.discount_amount)],
                ['Final Price', fmt.currency(selected.final_price)],
                ['Token Amount', fmt.currency(selected.token_amount)],
                ['Token Paid Date', fmt.date(selected.token_paid_date)],
                ['Token Expiry', fmt.date(selected.token_expiry_date)],
                ['Token Status', selected.token_status],
                ['Down Payment', fmt.currency(selected.down_payment_amount)],
                ['Total Paid', fmt.currency(selected.total_paid)],
                ['Total Due', fmt.currency(selected.total_due)],
                ['Marketing Officer', selected.marketing_officer || '—'],
                ['Notes', selected.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: 8 }}>
                  <div className="label" style={{ color: '#6b7280' }}>{label}</div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{String(value || '—')}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Close</button>
            <button className="btn-primary" onClick={() => { setModal(null); handleDownloadReceipt(selected) }}>
              <FiDownload size={14} /> Download Receipt
            </button>
          </div>
        </Modal>
      )}

      {/* ── INSTALLMENTS MODAL ──────────────────────────────── */}
      {modal === 'installments' && (
        <Modal title={`Installments — ${selected?.booking_code}`} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            {installLoading ? <Spinner /> : installments.length === 0 ? <Empty label="No installments found" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 8 }}>
                  {[
                    { label: 'Total', value: fmt.currency(selected?.final_price), color: '#0369a1' },
                    { label: 'Paid', value: fmt.currency(selected?.total_paid), color: '#16a34a' },
                    { label: 'Due', value: fmt.currency(selected?.total_due), color: '#dc2626' },
                  ].map(s => (
                    <div key={s.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {installments.map((ins: any) => (
                  <div key={ins.id} style={{
                    border: `1px solid ${ins.is_paid ? '#bbf7d0' : '#fed7aa'}`,
                    borderLeft: `4px solid ${ins.is_paid ? '#16a34a' : '#f97316'}`,
                    borderRadius: 10, padding: '12px 16px',
                    background: ins.is_paid ? '#f0fdf4' : '#fff7ed'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>Installment #{ins.installment_number}</span>
                        <span style={{ marginLeft: 10, fontSize: 12, color: '#6b7280' }}>Due: {fmt.date(ins.due_date)}</span>
                      </div>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: ins.is_paid ? '#16a34a' : '#f97316', color: '#fff'
                      }}>
                        {ins.is_paid ? 'PAID' : 'DUE'}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, fontSize: 13 }}>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: 11 }}>Total Amount</div>
                        <div style={{ fontWeight: 600 }}>{fmt.currency(ins.amount)}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: 11 }}>Paid</div>
                        <div style={{ fontWeight: 600, color: '#16a34a' }}>{fmt.currency(ins.paid_amount)}</div>
                      </div>
                      <div>
                        <div style={{ color: '#6b7280', fontSize: 11 }}>Due</div>
                        <div style={{ fontWeight: 600, color: '#dc2626' }}>{fmt.currency(ins.due_amount)}</div>
                      </div>
                    </div>
                    {ins.is_paid && ins.paid_date && (
                      <div style={{ marginTop: 6, fontSize: 11, color: '#374151' }}>
                        Paid on: {fmt.date(ins.paid_date)}
                      </div>
                    )}
                    {ins.notes && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#6b7280' }}>{ins.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── RECEIPTS LIST MODAL ──────────────────────────────── */}
      {modal === 'receipt_list' && (
        <Modal title={`Receipts — ${selected?.booking_code}`} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            {receiptListLoading ? <Spinner /> : receiptList.length === 0 ? <Empty label="No receipts found" /> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {receiptList.map((r: any) => (
                  <div key={r.id} style={{
                    border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>#{r.receipt_number}</span>
                        <Badge status={r.status} />
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{r.receipt_type_display}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151' }}>
                        Amount: <strong>{fmt.currency(r.amount)}</strong>
                        <span style={{ marginLeft: 12 }}>Date: {fmt.date(r.payment_date)}</span>
                        <span style={{ marginLeft: 12 }}>Mode: {r.payment_mode_display}</span>
                      </div>
                      {r.bank_name && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Bank: {r.bank_name} {r.cheque_number ? `| Cheque: ${r.cheque_number}` : ''}</div>}
                    </div>
                    <button
                      onClick={() => handleDownloadReceipt(selected, r)}
                      style={{ background: '#fce7f3', color: '#9d174d', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, fontSize: 13 }}>
                      <FiDownload size={14} /> PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </AppShell>
  )
}