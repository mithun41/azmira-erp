
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import api, { ENDPOINTS } from "@/lib/api";
import { Modal, PageHeader, Badge, Spinner, EmptyState, Field, ActionBtns, SearchBar } from "@/components/ui";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function UsersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({"username": "", "email": "", "full_name": "", "phone": "", "role": "", "password_hash": ""});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.USERS);
      setItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm({"username": "", "email": "", "full_name": "", "phone": "", "role": "", "password_hash": ""}); setShowModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm(item); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(ENDPOINTS.USER_DETAIL(editing.id), form);
        toast.success("Updated!");
      } else {
        await api.post(ENDPOINTS.USER_CREATE, form);
        toast.success("Created!");
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data ? JSON.stringify(err.response.data) : "Error occurred");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api.delete(ENDPOINTS.USER_DETAIL(id));
      toast.success("Deleted!");
      load();
    } catch { toast.error("Delete failed"); }
  };

  const filtered = items.filter((i) =>
    Object.values(i).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <PageHeader title="Users" subtitle="Manage system users" onAdd={openAdd} />

      <div className="erp-card">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search Users..." />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Is Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>
                    <td>{truncate(String(item.username ?? "—"))}</td>
                    <td>{truncate(String(item.full_name ?? "—"))}</td>
                    <td>{truncate(String(item.email ?? "—"))}</td>
                    <td>{truncate(String(item.role ?? "—"))}</td>
                    <td><Badge status={String(item.is_active)} /></td>
                    <td>
                      <ActionBtns
                        onEdit={() => openEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? "Edit Users" : "Add Users"} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          
          <Field label="Username" required>
            <input type="text" className="erp-input" value={form.username || ""}
              onChange={(e) => setForm({...form, username: e.target.value})} required />
          </Field>

          <Field label="Email" required>
            <input type="email" className="erp-input" value={form.email || ""}
              onChange={(e) => setForm({...form, email: e.target.value})} required />
          </Field>

          <Field label="Full Name" required>
            <input type="text" className="erp-input" value={form.full_name || ""}
              onChange={(e) => setForm({...form, full_name: e.target.value})} required />
          </Field>

          <Field label="Phone">
            <input type="text" className="erp-input" value={form.phone || ""}
              onChange={(e) => setForm({...form, phone: e.target.value})}  />
          </Field>

          <Field label="Role" required>
            <select className="erp-select" value={form.role || ""}
              onChange={(e) => setForm({...form, role: e.target.value})} required>
              <option value="">-- Select --</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="accounts">Accounts</option>
              <option value="marketing_officer">Marketing Officer</option>
              <option value="customer">Customer</option>
              <option value="investor">Investor</option>
            </select>
          </Field>

          <Field label="Password">
            <input type="password" className="erp-input" value={form.password_hash || ""}
              onChange={(e) => setForm({...form, password_hash: e.target.value})}  />
          </Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
