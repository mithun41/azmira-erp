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
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi'

const EMPTY: any = {
  user: '',
  investor_code: '',
  bank_name: '',
  bank_account: '',
  bank_branch: '',
  is_active: true
}

export default function Page() {
  const [items, setItems] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'edit'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const ep = ENDPOINTS.investors

  const load = () => {
    setLoading(true)
    fetchList(ep.list())
      .then(r => setItems(r.data))
      .finally(() => setLoading(false))
  }

  const loadUsers = async () => {
    try {
      const res = await fetchList(ENDPOINTS.users.list())
      setUsers(res.data?.results || res.data || [])
    } catch {
      toast.error('Failed to load users')
    }
  }

  useEffect(() => {
    load()
    loadUsers()
  }, [])

  const f = (k: string) => (e: any) =>
    setForm((p:any) => ({ ...p, [k]: e.target.value }))

  const openAdd = () => {
    setForm(EMPTY)
    setModal('add')
  }

  const openEdit = (item: any) => {
    setSelected(item)
    setForm({
      ...item,
      user: item.user?.id || item.user,
      is_active: item.is_active
    })
    setModal('edit')
  }

  const openView = (item: any) => {
    setSelected(item)
    setModal('view')
  }

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        user: Number(form.user),
        is_active: form.is_active
      }

      if (modal === 'add') {
        await createItem(ep.create(), payload)
        toast.success('Created')
      } else {
        await updateItem(ep.detail(selected.id), payload)
        toast.success('Updated')
      }

      setModal(null)
      load()
    } catch (err: any) {
      const e = err?.response?.data
      toast.error(e?.user?.[0] || e?.detail || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this investor?')) return
    await deleteItem(ep.detail(id))
    toast.success('Deleted')
    load()
  }

  // ================= LOGIC =================
  const usedUserIds = items.map(i => i.user?.id || i.user)

  const availableUsers = users.map(u => ({
    ...u,
    isUsed: usedUserIds.includes(u.id)
  }))

  const isEdit = modal === 'edit'

  return (
    <AppShell>
      <PageHeader
        title="Investors"
        subtitle="Manage investor profiles"
        onAdd={openAdd}
        addLabel="Add Investor"
      />

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? <Spinner /> : items.length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-5">Code</th>
                  <th className="p-5">User</th>
                  <th className="p-5">Bank</th>
                  <th className="p-5">Account</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="p-5 font-bold">{item.investor_code}</td>
                    <td className="p-5">{item.user_name || item.user}</td>
                    <td className="p-5">{item.bank_name || '—'}</td>
                    <td className="p-5">{item.bank_account || '—'}</td>
                    <td className="p-5">
                      <Badge status={item.is_active ? 'active' : 'cancelled'} />
                    </td>

                    <td className="p-5 text-right">
  <div className="flex justify-end gap-2">

    <button
      onClick={() => openView(item)}
      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold"
    >
      <FiEye size={14} />
    </button>

    <button
      onClick={() => openEdit(item)}
      className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold"
    >
      <FiEdit2 size={14} />
    </button>

    <button
      onClick={() => remove(item.id)}
      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold"
    >
      <FiTrash2 size={14} />
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

      {/* MODAL */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal
          title={modal === 'add' ? 'Create Investor' : 'Edit Investor'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <div className="modal-body">
            <div className="form-grid">

              {/* USER */}
              <div>
                <label className="label">User</label>
                <select
                  className="input"
                  value={form.user}
                  onChange={f('user')}
                  disabled={isEdit}   // 🔥 EDIT LOCK
                >
                  <option value="">Select User</option>

                  {availableUsers.map(u => (
                    <option
                      key={u.id}
                      value={u.id}
                      disabled={!isEdit && u.isUsed}  // Add mode only disable
                    >
                      {u.full_name}
                      {!isEdit && u.isUsed ? ' (Already Investor)' : ''}
                    </option>
                  ))}
                </select>

                {isEdit && (
                  <p style={{ fontSize: 12, color: '#6b7280' }}>
                    User cannot be changed in edit mode
                  </p>
                )}
              </div>

              <div>
                <label className="label">Investor Code</label>
                <input className="input" value={form.investor_code} onChange={f('investor_code')} />
              </div>

              <div>
                <label className="label">Bank Name</label>
                <input className="input" value={form.bank_name} onChange={f('bank_name')} />
              </div>

              <div>
                <label className="label">Account No</label>
                <input className="input" value={form.bank_account} onChange={f('bank_account')} />
              </div>

              <div>
                <label className="label">Branch</label>
                <input className="input" value={form.bank_branch} onChange={f('bank_branch')} />
              </div>

              {/* ACTIVE TOGGLE */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((p:any) => ({ ...p, is_active: e.target.checked }))
                  }
                />
                <label className="label">Active Investor</label>
              </div>

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

      {/* VIEW */}
      {modal === 'view' && selected && (
  <Modal title="Investor Details" onClose={() => setModal(null)} size="lg">
    <div className="modal-body">
      <div className="form-grid">

        {Object.entries(selected).map(([k, v]: [string, any]) => (
          <div key={k}>
            <div className="label" style={{ textTransform: 'capitalize' }}>
              {k.replace(/_/g, ' ')}
            </div>

            <div style={{ fontWeight: 500 }}>
              {v === null ||
              v === undefined ||
              v === '' ||
              (typeof v === 'string' && v.trim() === '')
                ? '—'
                : String(v)}
            </div>
          </div>
        ))}

      </div>
    </div>

    <div className="modal-footer">
      <button className="btn-primary" onClick={() => setModal(null)}>
        Close
      </button>
    </div>
  </Modal>
)}
    </AppShell>
  )
}