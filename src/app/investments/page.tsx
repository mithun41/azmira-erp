'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Empty from '@/components/ui/Empty'
import toast from 'react-hot-toast'
import { fetchList, createItem, updateItem, deleteItem, ENDPOINTS } from '@/lib/api'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

const EMPTY: any = {
  investor: '',
  invest_amount: '',
  investor_code: '',
  investor_name: '',
  invest_date: '',
  monthly_dividend_rate: '',
  agreement_number: '',
  status: 'active',
  notes: ''
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [investors, setInvestors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.investments

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

  useEffect(() => {
    load()
    loadInvestors()
  }, [])

  const f = (k: string) => (e: any) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm({ ...EMPTY, investor: '', invest_amount: '' })
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)

    setForm({
      investor: item.investor?.id || item.investor,
      invest_amount: item.invest_amount,
      investor_code: item.investor_code || '',
      investor_name: item.investor_name || '',
      invest_date: item.invest_date || '',
      monthly_dividend_rate: item.monthly_dividend_rate || '',
      agreement_number: item.agreement_number || '',
      status: item.status || 'active',
      notes: item.notes || ''
    })

    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)

    const cleanDate = (d: any) => {
      if (!d || d === '') return undefined
      return String(d).split('T')[0]
    }

    try {
      const payload = {
        ...form,
        investor: Number(form.investor),
        invest_amount: Number(form.invest_amount),
        invest_date: cleanDate(form.invest_date),
        monthly_dividend_rate: Number(form.monthly_dividend_rate || 0)
      }

      if (!payload.investor || !payload.invest_amount) {
        toast.error('Investor and Amount are required')
        setSaving(false)
        return
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
    } catch (err: any) {
      console.log(err?.response?.data)
      toast.error('Failed to save investment')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this investment?')) return
    await deleteItem(ep.detail(id))
    toast.success('Deleted')
    load()
  }

  const getVal = (v: any) =>
    v === null || v === '' || v === undefined ? '—' : String(v)

  return (
    <AppShell>

      <PageHeader
        title="Investments"
        subtitle="Manage investor investments"
        onAdd={openAdd}
        addLabel="Add Investment"
      />

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">

              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-5">Code</th>
                  <th className="p-5">Investor</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Dividend Rate</th>
                  <th className="p-5">Profit</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="p-5 font-bold">{getVal(item.investor_code)}</td>
                    <td className="p-5">
                      {item.investor_name || item.investor?.investor_name || '—'}
                    </td>
                    <td className="p-5">{getVal(item.invest_amount)}</td>
                    <td className="p-5">{getVal(item.invest_date)}</td>
                    <td className="p-5">{getVal(item.monthly_dividend_rate)}</td>
                    <td className="p-5">{getVal(item.total_profit_received)}</td>

                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">

                        <button onClick={() => openView(item)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg">
                          <FiEye />
                        </button>

                        <button onClick={() => openEdit(item)}
                          className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg">
                          <FiEdit2 />
                        </button>

                        <button onClick={() => remove(item.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                          <FiTrash2 />
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

      {/* ADD / EDIT */}
      {/* ADD / EDIT */}
{(modal === 'add' || modal === 'edit') && (
  <Modal
    title={modal === 'add' ? 'Add Investment' : 'Edit Investment'}
    onClose={() => setModal(null)}
    size="lg"
  >

    <div className="modal-body">
      <div className="form-grid">

        {/* INVESTOR */}
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

        {/* AMOUNT */}
        <div>
          <label className="label">Invest Amount</label>
          <input className="input" value={form.invest_amount} onChange={f('invest_amount')} />
        </div>

        {/* INVESTOR CODE */}
        <div>
          <label className="label">Investor Code</label>
          <input className="input" value={form.investor_code} onChange={f('investor_code')} />
        </div>

        {/* INVESTOR NAME */}
        <div>
          <label className="label">Investor Name</label>
          <input className="input" value={form.investor_name} onChange={f('investor_name')} />
        </div>

        {/* INVEST DATE */}
        <div>
          <label className="label">Invest Date</label>
          <input type="date" className="input" value={form.invest_date || ''} onChange={f('invest_date')} />
        </div>

        {/* DIVIDEND RATE */}
        <div>
          <label className="label">Dividend Rate</label>
          <input className="input" value={form.monthly_dividend_rate} onChange={f('monthly_dividend_rate')} />
        </div>

        {/* AGREEMENT */}
        <div>
          <label className="label">Agreement No</label>
          <input className="input" value={form.agreement_number} onChange={f('agreement_number')} />
        </div>

        {/* NOTES */}
        <div style={{ gridColumn: 'span 2' }}>
          <label className="label">Notes</label>
          <textarea className="input" value={form.notes} onChange={f('notes')} />
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
        <Modal title="Investment Details" onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([k, v]: any) => (
                <div key={k}>
                  <div className="label">{k.replace(/_/g, ' ')}</div>
                  <div>{v === null || v === '' ? '—' : String(v)}</div>
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