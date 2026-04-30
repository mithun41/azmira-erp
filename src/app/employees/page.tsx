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

const EMPTY: any = {employee_code: '', full_name: '', user: 0, department: '', designation: '', employment_type: '', joining_date: '', phone: '', email: '', nid: '', basic_salary: 0, bank_name: '', bank_account: '', address: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.employees
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
      <PageHeader title="Employees" subtitle="HR — Employee management" onAdd={openAdd} addLabel="New Employee" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>employee_code</th><th>full_name</th><th>department</th><th>designation</th><th>employment_type</th><th>basic_salary</th><th>is_active</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.employee_code ?? '—'}</td><td>{item.full_name ?? '—'}</td><td>{item.department ?? '—'}</td><td>{item.designation ?? '—'}</td><td>{item.employment_type ?? '—'}</td><td>{fmt.currency(item.basic_salary)}</td><td><Badge status={item.is_active ? 'active' : 'cancelled'} /></td>
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
        <Modal title={modal === 'add' ? 'New Employees' : 'Edit Employees'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Employee Code *</label><input className="input" type="text" value={form.employee_code||''} onChange={f('employee_code')} /></div>
              <div><label className="label">Full Name *</label><input className="input" type="text" value={form.full_name||''} onChange={f('full_name')} /></div>
              <div><label className="label">User ID</label><input className="input" type="number" value={form.user||''} onChange={f('user')} /></div>
              <div><label className="label">Department</label><input className="input" type="text" value={form.department||''} onChange={f('department')} /></div>
              <div><label className="label">Designation</label><input className="input" type="text" value={form.designation||''} onChange={f('designation')} /></div>
              <div><label className="label">Type</label><select className="input" value={form.employment_type||''} onChange={f('employment_type')}><option key='permanent' value='permanent'>permanent</option><option key='contract' value='contract'>contract</option><option key='probation' value='probation'>probation</option><option key='intern' value='intern'>intern</option></select></div>
              <div><label className="label">Joining Date</label><input className="input" type="date" value={form.joining_date||''} onChange={f('joining_date')} /></div>
              <div><label className="label">Phone</label><input className="input" type="text" value={form.phone||''} onChange={f('phone')} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email||''} onChange={f('email')} /></div>
              <div><label className="label">NID</label><input className="input" type="text" value={form.nid||''} onChange={f('nid')} /></div>
              <div><label className="label">Basic Salary</label><input className="input" type="number" value={form.basic_salary||''} onChange={f('basic_salary')} /></div>
              <div><label className="label">Bank Name</label><input className="input" type="text" value={form.bank_name||''} onChange={f('bank_name')} /></div>
              <div><label className="label">Account No</label><input className="input" type="text" value={form.bank_account||''} onChange={f('bank_account')} /></div>
              <div className="full"><label className="label">Address</label><textarea className="input" rows={2} value={form.address||''} onChange={f('address')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Employees Details" onClose={() => setModal(null)} size="lg">
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
