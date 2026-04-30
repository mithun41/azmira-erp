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

const EMPTY: any = {project: 0, dag_number: '', khotian_number: '', mouza: '', total_area: 0, area_unit: '', purchased_area: 0, land_owner_name: '', deed_number: '', deed_date: '', purchase_price: 0, land_status: '', registration_date: '', registration_number: '', namjari_done: '', sub_registry_office: '', notes: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.landRecords
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
      <PageHeader title="Land Records" subtitle="জমির দলিল ও রেকর্ড" onAdd={openAdd} addLabel="New Record" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>project</th><th>dag_number</th><th>khotian_number</th><th>mouza</th><th>total_area</th><th>land_status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.project ?? '—'}</td><td>{item.dag_number ?? '—'}</td><td>{item.khotian_number ?? '—'}</td><td>{item.mouza ?? '—'}</td><td>{item.total_area ?? '—'}</td><td>{item.land_status ?? '—'}</td>
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
        <Modal title={modal === 'add' ? 'New Land Records' : 'Edit Land Records'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Project ID *</label><input className="input" type="number" value={form.project||''} onChange={f('project')} /></div>
              <div><label className="label">দাগ নম্বর</label><input className="input" type="text" value={form.dag_number||''} onChange={f('dag_number')} /></div>
              <div><label className="label">খতিয়ান নম্বর</label><input className="input" type="text" value={form.khotian_number||''} onChange={f('khotian_number')} /></div>
              <div><label className="label">মৌজা</label><input className="input" type="text" value={form.mouza||''} onChange={f('mouza')} /></div>
              <div><label className="label">Total Area</label><input className="input" type="number" value={form.total_area||''} onChange={f('total_area')} /></div>
              <div><label className="label">Unit</label><select className="input" value={form.area_unit||''} onChange={f('area_unit')}><option key='katha' value='katha'>katha</option><option key='bigha' value='bigha'>bigha</option><option key='decimal' value='decimal'>decimal</option><option key='sqft' value='sqft'>sqft</option></select></div>
              <div><label className="label">Purchased Area</label><input className="input" type="number" value={form.purchased_area||''} onChange={f('purchased_area')} /></div>
              <div><label className="label">Owner Name</label><input className="input" type="text" value={form.land_owner_name||''} onChange={f('land_owner_name')} /></div>
              <div><label className="label">Deed Number</label><input className="input" type="text" value={form.deed_number||''} onChange={f('deed_number')} /></div>
              <div><label className="label">Deed Date</label><input className="input" type="date" value={form.deed_date||''} onChange={f('deed_date')} /></div>
              <div><label className="label">Purchase Price</label><input className="input" type="number" value={form.purchase_price||''} onChange={f('purchase_price')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.land_status||''} onChange={f('land_status')}><option key='porcha' value='porcha'>porcha</option><option key='khotian' value='khotian'>khotian</option><option key='deed_done' value='deed_done'>deed done</option><option key='baina' value='baina'>baina</option><option key='power_of_attorney' value='power_of_attorney'>power of attorney</option><option key='saf_kobola' value='saf_kobola'>saf kobola</option><option key='namjari' value='namjari'>namjari</option><option key='registration_done' value='registration_done'>registration done</option></select></div>
              <div><label className="label">Registration Date</label><input className="input" type="date" value={form.registration_date||''} onChange={f('registration_date')} /></div>
              <div><label className="label">Registration No</label><input className="input" type="text" value={form.registration_number||''} onChange={f('registration_number')} /></div>
              <div><label className="label">Namjari Done</label><select className="input" value={form.namjari_done||''} onChange={f('namjari_done')}><option key='false' value='false'>false</option><option key='true' value='true'>true</option></select></div>
              <div><label className="label">Sub Registry Office</label><input className="input" type="text" value={form.sub_registry_office||''} onChange={f('sub_registry_office')} /></div>
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
        <Modal title="Land Records Details" onClose={() => setModal(null)} size="lg">
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
