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

const EMPTY: any = {user: 0, officer_code: '', rank: '', upline: 0, joining_date: '', target_sales: 0, commission_rate_lot: 0, commission_rate_flat: 0}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.officers
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
      <PageHeader title="Marketing Officers" subtitle="Officer profiles and hierarchy" onAdd={openAdd} addLabel="New Officer" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>officer_code</th><th>user</th><th>rank</th><th>commission_rate_lot</th><th>commission_rate_flat</th><th>is_active</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.officer_code ?? '—'}</td><td>{item.user ?? '—'}</td><td>{item.rank ?? '—'}</td><td>{item.commission_rate_lot ?? '—'}</td><td>{item.commission_rate_flat ?? '—'}</td><td><Badge status={item.is_active ? 'active' : 'cancelled'} /></td>
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
        <Modal title={modal === 'add' ? 'New Marketing Officers' : 'Edit Marketing Officers'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">User ID *</label><input className="input" type="number" value={form.user||''} onChange={f('user')} /></div>
              <div><label className="label">Officer Code *</label><input className="input" type="text" value={form.officer_code||''} onChange={f('officer_code')} /></div>
              <div><label className="label">Rank</label><select className="input" value={form.rank||''} onChange={f('rank')}><option key='officer' value='officer'>officer</option><option key='senior_officer' value='senior_officer'>senior officer</option><option key='team_leader' value='team_leader'>team leader</option><option key='assistant_manager' value='assistant_manager'>assistant manager</option><option key='manager' value='manager'>manager</option><option key='senior_manager' value='senior_manager'>senior manager</option><option key='agm' value='agm'>agm</option><option key='dgm' value='dgm'>dgm</option><option key='gm' value='gm'>gm</option></select></div>
              <div><label className="label">Upline Officer ID</label><input className="input" type="number" value={form.upline||''} onChange={f('upline')} /></div>
              <div><label className="label">Joining Date</label><input className="input" type="date" value={form.joining_date||''} onChange={f('joining_date')} /></div>
              <div><label className="label">Monthly Target</label><input className="input" type="number" value={form.target_sales||''} onChange={f('target_sales')} /></div>
              <div><label className="label">Commission Rate Lot (%)</label><input className="input" type="number" value={form.commission_rate_lot||''} onChange={f('commission_rate_lot')} /></div>
              <div><label className="label">Commission Rate Flat (%)</label><input className="input" type="number" value={form.commission_rate_flat||''} onChange={f('commission_rate_flat')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Marketing Officers Details" onClose={() => setModal(null)} size="lg">
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
