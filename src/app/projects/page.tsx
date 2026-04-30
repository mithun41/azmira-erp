'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import Empty from '@/components/ui/Empty'
import toast from 'react-hot-toast'
import { api, ENDPOINTS, fetchList, createItem, updateItem, deleteItem } from '@/lib/api'
import { fmt } from '@/lib/utils'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

const EMPTY = { project_code:'', project_name:'', project_type:'lot', description:'', address:'', city:'', district:'', total_land_area:'', land_unit:'katha', total_plots:'', total_project_value:'', status:'active', launch_date:'' }

export default function ProjectsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
  try {
    setLoading(true);

    console.log("👉 API CALL START");

    const url = ENDPOINTS.projects.list();
    console.log("📡 URL:", url);

    const res = await fetchList(url);

    console.log("✅ RESPONSE:", res);
    console.log("📦 DATA:", res.data);

    setItems(res.data);
  } catch (err) {
    console.log("❌ ERROR:", err);
  } finally {
    setLoading(false);
    console.log("🏁 LOADING FINISHED");
  }
};
  useEffect(() => { load() }, [])

  const f = (k: string) => (e: any) => setForm((p:any) => ({ ...p, [k]: e.target.value }))

  const openAdd  = () => { setForm(EMPTY); setModal('add') }
  const openEdit = (item: any) => { setSelected(item); setForm(item); setModal('edit') }
  const openView = (item: any) => { setSelected(item); setModal('view') }

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') { await createItem(ENDPOINTS.projects.create(), form); toast.success('Project created') }
      else { await updateItem(ENDPOINTS.projects.detail(selected.id), form); toast.success('Project updated') }
      setModal(null); load()
    } catch { toast.error('Failed to save') } finally { setSaving(false) }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this project?')) return
    try { await deleteItem(ENDPOINTS.projects.detail(id)); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  return (
    <AppShell>
      <PageHeader title="Projects" subtitle="Manage real estate projects" onAdd={openAdd} addLabel="New Project" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>City</th><th>Plots</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td><code style={{ fontSize:12, background:'#f1f5f9', padding:'2px 6px', borderRadius:4 }}>{item.project_code}</code></td>
                  <td style={{ fontWeight:500 }}>{item.project_name}</td>
                  <td>{item.project_type}</td>
                  <td>{item.city || '—'}</td>
                  <td>{item.total_plots}</td>
                  <td>{fmt.currency(item.total_project_value)}</td>
                  <td><Badge status={item.status} /></td>
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
        <Modal title={modal === 'add' ? 'New Project' : 'Edit Project'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Project Code *</label><input className="input" value={form.project_code} onChange={f('project_code')} /></div>
              <div><label className="label">Project Name *</label><input className="input" value={form.project_name} onChange={f('project_name')} /></div>
              <div><label className="label">Type</label>
                <select className="input" value={form.project_type} onChange={f('project_type')}>
                  {['lot','flat','investment','commercial','mixed'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  {['upcoming','active','sold_out','completed','on_hold'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">City</label><input className="input" value={form.city} onChange={f('city')} /></div>
              <div><label className="label">District</label><input className="input" value={form.district} onChange={f('district')} /></div>
              <div><label className="label">Total Land Area</label><input className="input" type="number" value={form.total_land_area} onChange={f('total_land_area')} /></div>
              <div><label className="label">Land Unit</label>
                <select className="input" value={form.land_unit} onChange={f('land_unit')}>
                  {['katha','bigha','decimal','sqft'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div><label className="label">Total Plots</label><input className="input" type="number" value={form.total_plots} onChange={f('total_plots')} /></div>
              <div><label className="label">Total Project Value (৳)</label><input className="input" type="number" value={form.total_project_value} onChange={f('total_project_value')} /></div>
              <div><label className="label">Launch Date</label><input className="input" type="date" value={form.launch_date} onChange={f('launch_date')} /></div>
              <div><label className="label">Mouza</label><input className="input" value={form.mouza} onChange={f('mouza')} /></div>
              <div className="full"><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={f('address')} /></div>
              <div className="full"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={f('description')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}

      {modal === 'view' && selected && (
        <Modal title="Project Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).filter(([k]) => !['id','created_at','updated_at'].includes(k)).map(([k,v]) => (
                <div key={k}><div className="label">{k.replace(/_/g,' ')}</div><div style={{ fontSize:14, fontWeight:500 }}>{String(v) || '—'}</div></div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
