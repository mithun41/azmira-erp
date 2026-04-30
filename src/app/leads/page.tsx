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

const EMPTY: any = {lead_code: '', full_name: '', phone: '', email: '', address: '', source: '', status: '', assigned_to: 0, interested_in: 0, next_follow_up: '', notes: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.leads
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
      <PageHeader title="Lead Management" subtitle="Track potential customers" onAdd={openAdd} addLabel="New Lead" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>lead_code</th><th>full_name</th><th>phone</th><th>source</th><th>status</th><th>assigned_to</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.lead_code ?? '—'}</td><td>{item.full_name ?? '—'}</td><td>{item.phone ?? '—'}</td><td>{item.source ?? '—'}</td><td><Badge status={String(item.status)} /></td><td>{item.assigned_to ?? '—'}</td>
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
        <Modal title={modal === 'add' ? 'New Lead Management' : 'Edit Lead Management'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Lead Code *</label><input className="input" type="text" value={form.lead_code||''} onChange={f('lead_code')} /></div>
              <div><label className="label">Full Name *</label><input className="input" type="text" value={form.full_name||''} onChange={f('full_name')} /></div>
              <div><label className="label">Phone *</label><input className="input" type="text" value={form.phone||''} onChange={f('phone')} /></div>
              <div><label className="label">Email</label><input className="input" type="email" value={form.email||''} onChange={f('email')} /></div>
              <div><label className="label">Address</label><input className="input" type="text" value={form.address||''} onChange={f('address')} /></div>
              <div><label className="label">Source</label><select className="input" value={form.source||''} onChange={f('source')}><option key='walk_in' value='walk_in'>walk in</option><option key='referral' value='referral'>referral</option><option key='facebook' value='facebook'>facebook</option><option key='website' value='website'>website</option><option key='billboard' value='billboard'>billboard</option><option key='newspaper' value='newspaper'>newspaper</option><option key='phone_call' value='phone_call'>phone call</option><option key='other' value='other'>other</option></select></div>
              <div><label className="label">Status</label><select className="input" value={form.status||''} onChange={f('status')}><option key='new' value='new'>new</option><option key='contacted' value='contacted'>contacted</option><option key='interested' value='interested'>interested</option><option key='follow_up' value='follow_up'>follow up</option><option key='visit_scheduled' value='visit_scheduled'>visit scheduled</option><option key='visited' value='visited'>visited</option><option key='negotiating' value='negotiating'>negotiating</option><option key='converted' value='converted'>converted</option><option key='lost' value='lost'>lost</option><option key='not_interested' value='not_interested'>not interested</option></select></div>
              <div><label className="label">Assigned Officer ID</label><input className="input" type="number" value={form.assigned_to||''} onChange={f('assigned_to')} /></div>
              <div><label className="label">Interested Project ID</label><input className="input" type="number" value={form.interested_in||''} onChange={f('interested_in')} /></div>
              <div><label className="label">Next Follow Up</label><input className="input" type="datetime-local" value={form.next_follow_up||''} onChange={f('next_follow_up')} /></div>
              <div className="full"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes||''} onChange={f('notes')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Lead Management Details" onClose={() => setModal(null)} size="lg">
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
