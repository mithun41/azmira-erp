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

const EMPTY: any = {employee: 0, month: 0, year: 0, working_days: 0, present_days: 0, basic_salary: 0, payable_salary: 0, loan_deduction: 0, net_salary: 0, payment_date: '', payment_status: '', payment_mode: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.payroll
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
      <PageHeader title="Payroll" subtitle="Monthly salary records" onAdd={openAdd} addLabel="Generate Payroll" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>employee</th><th>month</th><th>year</th><th>present_days</th><th>basic_salary</th><th>net_salary</th><th>payment_status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.employee ?? '—'}</td><td>{item.month ?? '—'}</td><td>{item.year ?? '—'}</td><td>{item.present_days ?? '—'}</td><td>{fmt.currency(item.basic_salary)}</td><td>{fmt.currency(item.net_salary)}</td><td>{item.payment_status ?? '—'}</td>
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
        <Modal title={modal === 'add' ? 'New Payroll' : 'Edit Payroll'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Employee ID *</label><input className="input" type="number" value={form.employee||''} onChange={f('employee')} /></div>
              <div><label className="label">Month *</label><input className="input" type="number" value={form.month||''} onChange={f('month')} /></div>
              <div><label className="label">Year *</label><input className="input" type="number" value={form.year||''} onChange={f('year')} /></div>
              <div><label className="label">Working Days</label><input className="input" type="number" value={form.working_days||''} onChange={f('working_days')} /></div>
              <div><label className="label">Present Days</label><input className="input" type="number" value={form.present_days||''} onChange={f('present_days')} /></div>
              <div><label className="label">Basic Salary</label><input className="input" type="number" value={form.basic_salary||''} onChange={f('basic_salary')} /></div>
              <div><label className="label">Payable Salary</label><input className="input" type="number" value={form.payable_salary||''} onChange={f('payable_salary')} /></div>
              <div><label className="label">Loan Deduction</label><input className="input" type="number" value={form.loan_deduction||''} onChange={f('loan_deduction')} /></div>
              <div><label className="label">Net Salary</label><input className="input" type="number" value={form.net_salary||''} onChange={f('net_salary')} /></div>
              <div><label className="label">Payment Date</label><input className="input" type="date" value={form.payment_date||''} onChange={f('payment_date')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.payment_status||''} onChange={f('payment_status')}><option key='pending' value='pending'>pending</option><option key='paid' value='paid'>paid</option></select></div>
              <div><label className="label">Payment Mode</label><input className="input" type="text" value={form.payment_mode||''} onChange={f('payment_mode')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Payroll Details" onClose={() => setModal(null)} size="lg">
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
