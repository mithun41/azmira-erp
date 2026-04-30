'use client'

import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import Spinner from '@/components/ui/Spinner'
import Empty from '@/components/ui/Empty'
import toast from 'react-hot-toast'
import { fetchList, createItem, updateItem, deleteItem, ENDPOINTS } from '@/lib/api'
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

/* ================= EMPTY ================= */
const EMPTY: any = {
  customer_code: '',
  full_name: '',
  father_name: '',
  mother_name: '',
  spouse_name: '',
  phone: '',
  phone_alt: '',
  email: '',
  nid: '',
  date_of_birth: '',
  customer_type: 'individual',
  source: 'walk_in',
  present_address: '',
  permanent_address: '',
  notes: '',

  user: '',
  referred_by: '',
  profile_image: null,
  nid_image: null,
}

/* ================= FORM DATA ================= */
const buildFormData = (data: any) => {
  const formData = new FormData()

  Object.keys(data).forEach((key) => {
    const value = data[key]

    if (value === null || value === undefined || value === '') return

    // FILES
    if (key === 'profile_image' || key === 'nid_image') {
      if (value instanceof File) {
        formData.append(key, value)
      }
      return
    }

    // FK fields
    if (key === 'user' || key === 'referred_by') {
      formData.append(key, String(value))
      return
    }

    formData.append(key, value)
  })

  return formData
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [officers, setOfficers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [modal, setModal] = useState<'add' | 'edit' | 'view' | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.customers

  /* ================= LOAD ================= */
  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false))
  }

  const loadUsers = () => {
    fetchList(ENDPOINTS.users.list())
      .then((r) => setUsers(r.data))
      .catch(() => {})
  }

  const loadOfficers = () => {
    fetchList(ENDPOINTS.officers.list())
      .then((r) => setOfficers(r.data))
      .catch(() => {})
  }

  useEffect(() => {
    load()
    loadUsers()
    loadOfficers()
  }, [])

  /* ================= HANDLERS ================= */
  const f = (k: string) => (e: any) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const fileChange = (k: string) => (e: any) =>
    setForm((p: any) => ({ ...p, [k]: e.target.files?.[0] }))

  /* ================= MODALS ================= */
  const openAdd = () => {
    setForm(EMPTY)
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm({
      ...item,
      user: item.user || '',
      referred_by: item.referred_by || '',
    })
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  /* ================= SAVE ================= */
  const save = async () => {
    setSaving(true)

    try {
      const payload = buildFormData(form)

      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Customer created')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Customer updated')
      }

      setModal(null)
      load()
    } catch (err: any) {
      console.log('❌ ERROR:', err.response?.data || err.message)
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  /* ================= DELETE ================= */
  const remove = async (id: number) => {
    if (!confirm('Delete this customer?')) return

    try {
      await deleteItem(ep.detail(id))
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Customers"
        subtitle="Manage customer database"
        onAdd={openAdd}
        addLabel="New Customer"
      />

      <div className="card">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <Empty />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Type</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.customer_code}</td>
                  <td>{item.full_name}</td>
                  <td>{item.phone}</td>
                  <td>{item.email}</td>
                  <td>{item.customer_type}</td>
                  <td>{item.source}</td>

                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-view" onClick={() => openView(item)}>
                        <FiEye />
                      </button>

                      <button className="btn-edit" onClick={() => openEdit(item)}>
                        <FiEdit2 />
                      </button>

                      <button className="btn-danger" onClick={() => remove(item.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title="Customer" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">

              <input className="input" placeholder="Customer Code" value={form.customer_code ?? ''} onChange={f('customer_code')} />
              <input className="input" placeholder="Full Name" value={form.full_name ?? ''} onChange={f('full_name')} />

              <input className="input" placeholder="Father Name" value={form.father_name ?? ''} onChange={f('father_name')} />
              <input className="input" placeholder="Mother Name" value={form.mother_name ?? ''} onChange={f('mother_name')} />
              <input className="input" placeholder="Spouse Name" value={form.spouse_name ?? ''} onChange={f('spouse_name')} />

              <input className="input" placeholder="Phone" value={form.phone ?? ''} onChange={f('phone')} />
              <input className="input" placeholder="Alt Phone" value={form.phone_alt ?? ''} onChange={f('phone_alt')} />

              <input className="input" placeholder="Email" value={form.email ?? ''} onChange={f('email')} />
              <input className="input" placeholder="NID" value={form.nid ?? ''} onChange={f('nid')} />

              <input className="input" type="date" value={form.date_of_birth ?? ''} onChange={f('date_of_birth')} />

              {/* TYPE */}
              <select className="input" value={form.customer_type ?? ''} onChange={f('customer_type')}>
                <option value="individual">Individual</option>
                <option value="joint">Joint</option>
                <option value="corporate">Corporate</option>
              </select>

              {/* SOURCE */}
              <select className="input" value={form.source ?? ''} onChange={f('source')}>
                <option value="walk_in">Walk In</option>
                <option value="referral">Referral</option>
                <option value="marketing">Marketing</option>
                <option value="online">Online</option>
                <option value="advertisement">Advertisement</option>
                <option value="existing">Existing</option>
              </select>

              {/* USER */}
              <select className="input" value={form.user ?? ''} onChange={f('user')}>
                <option value="">Select User</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name}
                  </option>
                ))}
              </select>

              {/* REFERRED BY OFFICERS */}
              <select className="input" value={form.referred_by ?? ''} onChange={f('referred_by')}>
                <option value="">Referred By</option>
                {officers.map((o: any) => (
                  <option key={o.id} value={o.id}>
                    {o.user_name || o.name || `Officer ${o.id}`}
                  </option>
                ))}
              </select>

              {/* FILES */}
              <input type="file" className="input" onChange={fileChange('profile_image')} />
              <input type="file" className="input" onChange={fileChange('nid_image')} />

              <textarea className="input full" placeholder="Present Address" value={form.present_address ?? ''} onChange={f('present_address')} />
              <textarea className="input full" placeholder="Permanent Address" value={form.permanent_address ?? ''} onChange={f('permanent_address')} />
              <textarea className="input full" placeholder="Notes" value={form.notes ?? ''} onChange={f('notes')} />

            </div>
          </div>

          <div className="modal-footer">
            <button onClick={() => setModal(null)}>Cancel</button>
            <button onClick={save} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}

      {/* ================= VIEW ================= */}
      {modal === 'view' && selected && (
        <Modal title="Customer Details" onClose={() => setModal(null)} size="lg">
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([k, v]) => (
                <div key={k}>
                  <div className="label">{k.replace(/_/g, ' ')}</div>
                  <div style={{ fontWeight: 500 }}>{String(v ?? '—')}</div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}