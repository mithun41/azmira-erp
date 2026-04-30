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

const EMPTY: any = {document_type: '', title: '', booking: 0, project: 0, customer: 0, notes: '', is_signed: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.documents
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
      <PageHeader title="Documents" subtitle="Booking MOU, deed draft, agreements" onAdd={openAdd} addLabel="Upload Document" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>document_type</th><th>title</th><th>booking</th><th>project</th><th>customer</th><th>is_signed</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.document_type ?? '—'}</td><td>{item.title ?? '—'}</td><td>{item.booking ?? '—'}</td><td>{item.project ?? '—'}</td><td>{item.customer ?? '—'}</td><td>{item.is_signed ?? '—'}</td>
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
        <Modal title={modal === 'add' ? 'New Documents' : 'Edit Documents'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Type *</label><select className="input" value={form.document_type||''} onChange={f('document_type')}><option key='booking_mou' value='booking_mou'>booking mou</option><option key='deed_draft' value='deed_draft'>deed draft</option><option key='agreement' value='agreement'>agreement</option><option key='registration' value='registration'>registration</option><option key='power_of_attorney' value='power_of_attorney'>power of attorney</option><option key='namjari' value='namjari'>namjari</option><option key='porcha' value='porcha'>porcha</option><option key='other' value='other'>other</option></select></div>
              <div><label className="label">Title *</label><input className="input" type="text" value={form.title||''} onChange={f('title')} /></div>
              <div><label className="label">Booking ID</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Project ID</label><input className="input" type="number" value={form.project||''} onChange={f('project')} /></div>
              <div><label className="label">Customer ID</label><input className="input" type="number" value={form.customer||''} onChange={f('customer')} /></div>
              <div className="full"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={f('notes')} /></div>
              <div><label className="label">Signed?</label><select className="input" value={form.is_signed||''} onChange={f('is_signed')}><option key='false' value='false'>false</option><option key='true' value='true'>true</option></select></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Documents Details" onClose={() => setModal(null)} size="lg">
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
