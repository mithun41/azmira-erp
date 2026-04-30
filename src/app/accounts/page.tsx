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

const EMPTY: any = {account_code: '', account_name: '', account_type: '', parent: 0, opening_balance: 0}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.accountHeads
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
      <PageHeader title="Account Heads" subtitle="Chart of accounts" onAdd={openAdd} addLabel="New Account Head" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>account_code</th><th>account_name</th><th>account_type</th><th>current_balance</th><th>is_active</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.account_code ?? '—'}</td><td>{item.account_name ?? '—'}</td><td>{item.account_type ?? '—'}</td><td>{item.current_balance ?? '—'}</td><td><Badge status={item.is_active ? 'active' : 'cancelled'} /></td>
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
        <Modal title={modal === 'add' ? 'New Account Heads' : 'Edit Account Heads'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Account Code *</label><input className="input" type="text" value={form.account_code||''} onChange={f('account_code')} /></div>
              <div><label className="label">Account Name *</label><input className="input" type="text" value={form.account_name||''} onChange={f('account_name')} /></div>
              <div><label className="label">Type *</label><select className="input" value={form.account_type||''} onChange={f('account_type')}><option key='income' value='income'>income</option><option key='expense' value='expense'>expense</option><option key='asset' value='asset'>asset</option><option key='liability' value='liability'>liability</option><option key='equity' value='equity'>equity</option></select></div>
              <div><label className="label">Parent Account ID</label><input className="input" type="number" value={form.parent||''} onChange={f('parent')} /></div>
              <div><label className="label">Opening Balance</label><input className="input" type="number" value={form.opening_balance||''} onChange={f('opening_balance')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Account Heads Details" onClose={() => setModal(null)} size="lg">
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
