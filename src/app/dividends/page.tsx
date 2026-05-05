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
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

const EMPTY: any = {
  investment: 0,
  investor: 0,
  month: 0,
  year: 0,
  base_amount: 0,
  dividend_rate: 0,
  dividend_amount: 0,
  status: ''
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [investors, setInvestors] = useState<any[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.dividends

  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  const loadInvestors = async () => {
    try {
      const res = await fetchList(ENDPOINTS.investors.list())
      setInvestors(res.data?.results || res.data || [])
    } catch {
      toast.error('Failed to load investors')
    }
  }

  const loadInvestments = async () => {
    try {
      const res = await fetchList(ENDPOINTS.investments.list())
      setInvestments(res.data?.results || res.data || [])
    } catch {
      toast.error('Failed to load investments')
    }
  }

  useEffect(() => {
    load()
    loadInvestors()
    loadInvestments()
  }, [])

  const f = (k: string) => (e: any) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm(EMPTY)
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm(item)
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        investment: Number(form.investment),
        investor: Number(form.investor),
        month: Number(form.month),
        year: Number(form.year),
        base_amount: Number(form.base_amount),
        dividend_rate: Number(form.dividend_rate),
        dividend_amount: Number(form.dividend_amount)
      }

      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Created')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Updated')
      }

      setModal(null)
      load()
    } catch (err) {
      console.log(err)
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

  // ================= NAME RESOLVERS =================
  const getInvestorName = (item: any) => {
    return (
      item.investor_name ||
      item.investor?.investor_name ||
      item.investor?.user_name ||
      item.investor?.user?.full_name ||
      '—'
    )
  }

  const getInvestmentName = (item: any) => {
    return (
      item.investment_name ||
      item.investment?.name ||
      item.investment?.title ||
      `Investment #${item.investment}` ||
      '—'
    )
  }

  const val = (v: any) =>
    v === null || v === undefined || v === '' ? '—' : String(v)

  return (
    <AppShell>

      <PageHeader
        title="Dividends"
        subtitle="Monthly dividend records"
        onAdd={openAdd}
        addLabel="New Dividend"
      />

      {/* TABLE */}
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Investor</th>
                  <th>Investment</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Rate</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{getInvestorName(item)}</td>
                    <td>{getInvestmentName(item)}</td>
                    <td>{val(item.month)}</td>
                    <td>{val(item.year)}</td>
                    <td>{val(item.dividend_rate)}</td>
                    <td>{val(item.dividend_amount)}</td>
                    <td><Badge status={String(item.status)} /></td>

                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>

                        <button
                          onClick={() => openView(item)}
                          style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: 6 }}
                        >
                          <FiEye size={13} />
                        </button>

                        <button
                          onClick={() => openEdit(item)}
                          style={{ background: '#fef9c3', color: '#92400e', border: 'none', padding: '4px 8px', borderRadius: 6 }}
                        >
                          <FiEdit2 size={13} />
                        </button>

                        <button
                          onClick={() => remove(item.id)}
                          style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 8px', borderRadius: 6 }}
                        >
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

      {/* MODAL */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'New Dividend' : 'Edit Dividend'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <div className="modal-body">
            <div className="form-grid">

              <div>
                <label className="label">Investment</label>
                <select className="input" value={form.investment} onChange={f('investment')}>
                  <option value="">Select Investment</option>
                  {investments.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.investor_code || i.name || `Investment #${i.id}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Investor</label>
                <select className="input" value={form.investor} onChange={f('investor')}>
                  <option value="">Select Investor</option>
                  {investors.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.investor_name || i.user_name || i.user?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Month</label>
                <input className="input" value={form.month} onChange={f('month')} />
              </div>

              <div>
                <label className="label">Year</label>
                <input className="input" value={form.year} onChange={f('year')} />
              </div>

              <div>
                <label className="label">Base Amount</label>
                <input className="input" value={form.base_amount} onChange={f('base_amount')} />
              </div>

              <div>
                <label className="label">Dividend Rate</label>
                <input className="input" value={form.dividend_rate} onChange={f('dividend_rate')} />
              </div>

              <div>
                <label className="label">Dividend Amount</label>
                <input className="input" value={form.dividend_amount} onChange={f('dividend_amount')} />
              </div>

              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  <option value="generated">generated</option>
                  <option value="paid">paid</option>
                  <option value="pending_withdrawal">pending withdrawal</option>
                </select>
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button onClick={() => setModal(null)}>Cancel</button>
            <button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW */}
      {modal === 'view' && selected && (
        <Modal title="Dividend Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([k, v]: any) => (
                <div key={k}>
                  <div className="label">{k.replace(/_/g, ' ')}</div>
                  <div>{val(v)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button onClick={() => setModal(null)}>Close</button>
          </div>
        </Modal>
      )}

    </AppShell>
  )
}