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

const EMPTY: any = {asset_type: '', asset_name: '', asset_code: '', assigned_to: 0, assigned_date: '', condition: '', notes: '', is_returned: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.assets
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
      <PageHeader title="Company Assets" subtitle="Mobile, SIM, vehicle assignments" onAdd={openAdd} addLabel="New Asset" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>asset_type</th><th>asset_name</th><th>asset_code</th><th>assigned_to</th><th>assigned_date</th><th>is_returned</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.asset_type ?? '—'}</td><td>{item.asset_name ?? '—'}</td><td>{item.asset_code ?? '—'}</td><td>{item.assigned_to ?? '—'}</td><td>{fmt.date(item.assigned_date)}</td><td><Badge status={item.is_returned ? 'active' : 'cancelled'} /></td>
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
        <Modal title={modal === 'add' ? 'New Company Assets' : 'Edit Company Assets'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Type *</label><select className="input" value={form.asset_type||''} onChange={f('asset_type')}><option key='mobile' value='mobile'>mobile</option><option key='sim' value='sim'>sim</option><option key='vehicle' value='vehicle'>vehicle</option><option key='laptop' value='laptop'>laptop</option><option key='other' value='other'>other</option></select></div>
              <div><label className="label">Asset Name *</label><input className="input" type="text" value={form.asset_name||''} onChange={f('asset_name')} /></div>
              <div><label className="label">Asset Code</label><input className="input" type="text" value={form.asset_code||''} onChange={f('asset_code')} /></div>
              <div><label className="label">Assigned To (User ID)</label><input className="input" type="number" value={form.assigned_to||''} onChange={f('assigned_to')} /></div>
              <div><label className="label">Assigned Date</label><input className="input" type="date" value={form.assigned_date||''} onChange={f('assigned_date')} /></div>
              <div><label className="label">Condition</label><input className="input" type="text" value={form.condition||''} onChange={f('condition')} /></div>
              <div className="full"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={f('notes')} /></div>
              <div><label className="label">Returned?</label><select className="input" value={form.is_returned||''} onChange={f('is_returned')}><option key='false' value='false'>false</option><option key='true' value='true'>true</option></select></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Company Assets Details" onClose={() => setModal(null)} size="lg">
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
