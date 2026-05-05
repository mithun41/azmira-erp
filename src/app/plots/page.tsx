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

const EMPTY: any = {
  project: '',
  plot_number: '',
  plot_type: 'residential',
  area: 0,
  area_unit: 'katha',
  price_per_unit: 0,
  total_price: 0,
  discount_amount: 0,
  final_price: 0,
  facing: '',
  floor_number: 0,
  flat_number: '',
  bedrooms: 0,
  bathrooms: 0,
  status: 'available',
  notes: ''
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [errors, setErrors] = useState<any>({}) // Validation error state
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.plots

  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  const loadProjects = async () => {
    try {
      const res = await fetchList(ENDPOINTS.projects.list())
      setProjects(res.data)
    } catch {
      toast.error('Failed to load projects')
    }
  }

  useEffect(() => {
    load()
    loadProjects()
  }, [])

  const f = (k: string) => (e: any) => {
    setForm((p: any) => ({ ...p, [k]: e.target.value }))
    // Field type korar somoy oi specific error muche fela
    if (errors[k]) {
      setErrors((prev: any) => ({ ...prev, [k]: null }))
    }
  }

  const openAdd = () => {
    setForm(EMPTY)
    setErrors({})
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm(item)
    setErrors({})
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)
    setErrors({}) // Purono error clear kora
    try {
      const payload = {
        ...form,
        project: form.project ? Number(form.project) : null,
        area: Number(form.area),
        price_per_unit: Number(form.price_per_unit),
        total_price: Number(form.total_price),
        discount_amount: Number(form.discount_amount),
        final_price: Number(form.final_price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        floor_number: Number(form.floor_number),
      }

      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Successfully Created')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Successfully Updated')
      }

      setModal(null)
      load()
    } catch (err: any) {
      // Backend error response handle kora
      if (err.response && err.response.data) {
        setErrors(err.response.data)
        toast.error('Please fix the errors in the form')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Are you sure you want to delete?')) return
    try {
      await deleteItem(ep.detail(id))
      toast.success('Deleted Successfully')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  // Error Helper Component
  const ErrorMsg = ({ name }: { name: string }) => (
    errors[name] ? <div className="text-red-500 text-xs mt-1 font-medium">{errors[name][0]}</div> : null
  )

  return (
    <AppShell>
      <PageHeader
        title="Plots / Flats"
        subtitle="Manage plot and flat inventory"
        onAdd={openAdd}
        addLabel="New Plot"
      />

      <div className="card">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plot Number</th>
                  <th>Project</th>
                  <th>Type</th>
                  <th>Area</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.plot_number ?? '—'}</td>
                    <td>{item.project_name || item.project ?? '—'}</td>
                    <td className="capitalize">{item.plot_type ?? '—'}</td>
                    <td>{item.area} {item.area_unit}</td>
                    <td>{fmt.currency(item.total_price)}</td>
                    <td><Badge status={String(item.status)} /></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openView(item)} className="btn-icon-view">
                          <FiEye size={13} />
                        </button>
                        <button onClick={() => openEdit(item)} className="btn-icon-edit">
                          <FiEdit2 size={13} />
                        </button>
                        <button onClick={() => remove(item.id)} className="btn-danger p-1">
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'New Plots / Flats' : 'Edit Plots / Flats'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <div className="modal-body">
            <div className="form-grid">

              {/* PROJECT */}
              <div>
                <label className="label">Project *</label>
                <select
                  className={`input ${errors.project ? 'border-red-500' : ''}`}
                  value={form.project || ''}
                  onChange={f('project')}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.project_name}</option>
                  ))}
                </select>
                <ErrorMsg name="project" />
              </div>

              {/* PLOT CODE */}
              <div>
                <label className="label">Plot Code *</label>
                <input 
                  className={`input ${errors.plot_number ? 'border-red-500' : ''}`} 
                  value={form.plot_number || ''} 
                  onChange={f('plot_number')} 
                />
                <ErrorMsg name="plot_number" />
              </div>

              {/* TYPE */}
              <div>
                <label className="label">Type</label>
                <select className="input" value={form.plot_type || ''} onChange={f('plot_type')}>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="corner">Corner</option>
                  <option value="road_facing">Road Facing</option>
                </select>
                <ErrorMsg name="plot_type" />
              </div>

              {/* AREA */}
              <div>
                <label className="label">Area</label>
                <input 
                  className={`input ${errors.area ? 'border-red-500' : ''}`}
                  type="number" 
                  value={form.area || ''} 
                  onChange={f('area')} 
                />
                <ErrorMsg name="area" />
              </div>

              {/* AREA UNIT */}
              <div>
                <label className="label">Area Unit</label>
                <select className="input" value={form.area_unit || ''} onChange={f('area_unit')}>
                  <option value="katha">Katha</option>
                  <option value="sqft">Sqft</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>

              {/* PRICE */}
              <div>
                <label className="label">Total Price</label>
                <input 
                  className={`input ${errors.total_price ? 'border-red-500' : ''}`}
                  type="number" 
                  value={form.total_price || ''} 
                  onChange={f('total_price')} 
                />
                <ErrorMsg name="total_price" />
              </div>

              {/* STATUS */}
              <div>
                <label className="label">Status</label>
                <select className="input" value={form.status || ''} onChange={f('status')}>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="sold">Sold</option>
                  <option value="hold">Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ErrorMsg name="status" />
              </div>

              {/* NOTES */}
              <div className="full">
                <label className="label">Notes</label>
                <textarea 
                  className="input" 
                  rows={2} 
                  value={form.notes || ''} 
                  onChange={f('notes')} 
                />
                <ErrorMsg name="notes" />
              </div>

            </div>
          </div>

          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* VIEW MODAL */}
      {modal === 'view' && selected && (
        <Modal title="Plots / Flats Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k} className="border-b pb-2 border-gray-100">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">{k.replace(/_/g, ' ')}</div>
                  <div className="text-sm">{String(v ?? '—')}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      <style jsx>{`
        .btn-icon-view { background: #e0f2fe; color: #0369a1; border: none; padding: 6px; border-radius: 6px; cursor: pointer; }
        .btn-icon-edit { background: #fef9c3; color: #92400e; border: none; padding: 6px; border-radius: 6px; cursor: pointer; }
        .text-error { color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem; }
      `}</style>
    </AppShell>
  )
}