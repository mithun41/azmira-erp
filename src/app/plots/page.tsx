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

const EMPTY: any = {project: 0, plot_number: '', plot_type: '', area: 0, area_unit: '', price_per_unit: 0, total_price: 0, discount_amount: 0, final_price: 0, facing: '', floor_number: 0, flat_number: '', bedrooms: 0, bathrooms: 0, status: '', notes: ''}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.plots
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
      <PageHeader title="Plots / Flats" subtitle="Manage plot and flat inventory" onAdd={openAdd} addLabel="New Plot" />
      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>plot_number</th><th>project</th><th>plot_type</th><th>area</th><th>area_unit</th><th>total_price</th><th>status</th><th>Actions</th></tr></thead>
              <tbody>{items.map(item => (
                <tr key={item.id}>
                  <td>{item.plot_number ?? '—'}</td><td>{item.project ?? '—'}</td><td>{item.plot_type ?? '—'}</td><td>{item.area ?? '—'}</td><td>{item.area_unit ?? '—'}</td><td>{fmt.currency(item.total_price)}</td><td><Badge status={String(item.status)} /></td>
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
        <Modal title={modal === 'add' ? 'New Plots / Flats' : 'Edit Plots / Flats'} onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Project ID *</label><input className="input" type="number" value={form.project||''} onChange={f('project')} /></div>
              <div><label className="label">Plot Number *</label><input className="input" type="text" value={form.plot_number||''} onChange={f('plot_number')} /></div>
              <div><label className="label">Type</label><select className="input" value={form.plot_type||''} onChange={f('plot_type')}><option key='residential' value='residential'>residential</option><option key='commercial' value='commercial'>commercial</option><option key='corner' value='corner'>corner</option><option key='road_facing' value='road_facing'>road facing</option></select></div>
              <div><label className="label">Area</label><input className="input" type="number" value={form.area||''} onChange={f('area')} /></div>
              <div><label className="label">Area Unit</label><select className="input" value={form.area_unit||''} onChange={f('area_unit')}><option key='katha' value='katha'>katha</option><option key='sqft' value='sqft'>sqft</option><option key='bigha' value='bigha'>bigha</option></select></div>
              <div><label className="label">Price Per Unit</label><input className="input" type="number" value={form.price_per_unit||''} onChange={f('price_per_unit')} /></div>
              <div><label className="label">Total Price</label><input className="input" type="number" value={form.total_price||''} onChange={f('total_price')} /></div>
              <div><label className="label">Discount</label><input className="input" type="number" value={form.discount_amount||''} onChange={f('discount_amount')} /></div>
              <div><label className="label">Final Price</label><input className="input" type="number" value={form.final_price||''} onChange={f('final_price')} /></div>
              <div><label className="label">Facing</label><select className="input" value={form.facing||''} onChange={f('facing')}><option key='north' value='north'>north</option><option key='south' value='south'>south</option><option key='east' value='east'>east</option><option key='west' value='west'>west</option><option key='north_east' value='north_east'>north east</option><option key='north_west' value='north_west'>north west</option><option key='south_east' value='south_east'>south east</option><option key='south_west' value='south_west'>south west</option></select></div>
              <div><label className="label">Floor No (Flat)</label><input className="input" type="number" value={form.floor_number||''} onChange={f('floor_number')} /></div>
              <div><label className="label">Flat No</label><input className="input" type="text" value={form.flat_number||''} onChange={f('flat_number')} /></div>
              <div><label className="label">Bedrooms</label><input className="input" type="number" value={form.bedrooms||''} onChange={f('bedrooms')} /></div>
              <div><label className="label">Bathrooms</label><input className="input" type="number" value={form.bathrooms||''} onChange={f('bathrooms')} /></div>
              <div><label className="label">Status</label><select className="input" value={form.status||''} onChange={f('status')}><option key='available' value='available'>available</option><option key='booked' value='booked'>booked</option><option key='sold' value='sold'>sold</option><option key='hold' value='hold'>hold</option><option key='cancelled' value='cancelled'>cancelled</option></select></div>
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
        <Modal title="Plots / Flats Details" onClose={() => setModal(null)} size="lg">
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
