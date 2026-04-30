"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import api, { ENDPOINTS } from "@/lib/api";
import { Modal, PageHeader, Badge, Spinner, EmptyState, Field, ActionBtns, SearchBar } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AttendancePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ employee: "", attendance_date: "", status: "present", check_in: "", check_out: "", remarks: "" });

  const load = async () => {
    setLoading(true);
    try { const res = await api.get(ENDPOINTS.ATTENDANCE); setItems(Array.isArray(res.data) ? res.data : (res.data.results || [])); }
    catch { toast.error("Failed to load"); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) { await api.patch(ENDPOINTS.ATTENDANCE_DETAIL(editing.id), form); toast.success("Updated!"); }
      else { await api.post(ENDPOINTS.ATTENDANCE_CREATE, form); toast.success("Created!"); }
      setShowModal(false); load();
    } catch (err: any) { toast.error(JSON.stringify(err?.response?.data) || "Error"); }
  };

  const filtered = items.filter(i => Object.values(i).some(v => String(v).toLowerCase().includes(search.toLowerCase())));

  return (
    <DashboardLayout>
      <PageHeader title="Attendance" subtitle="Daily attendance records" onAdd={() => { setEditing(null); setForm({ employee: "", attendance_date: new Date().toISOString().split("T")[0], status: "present", check_in: "", check_out: "", remarks: "" }); setShowModal(true); }} />
      <div className="erp-card">
        <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search attendance..." /></div>
        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead><tr><th>#</th><th>Employee</th><th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th><th>Total Hours</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>
                    <td>{item.employee}</td>
                    <td>{formatDate(item.attendance_date)}</td>
                    <td><Badge status={item.status} /></td>
                    <td>{item.check_in || "—"}</td>
                    <td>{item.check_out || "—"}</td>
                    <td>{item.total_hours || "—"}</td>
                    <td><ActionBtns onEdit={() => { setEditing(item); setForm(item); setShowModal(true); }} onDelete={async () => { if (!confirm("Delete?")) return; await api.delete(ENDPOINTS.ATTENDANCE_DETAIL(item.id)); load(); }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Attendance" : "Mark Attendance"} size="md">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Field label="Employee ID" required><input type="number" className="erp-input" value={form.employee || ""} onChange={e => setForm({...form, employee: e.target.value})} required /></Field>
          <Field label="Date" required><input type="date" className="erp-input" value={form.attendance_date || ""} onChange={e => setForm({...form, attendance_date: e.target.value})} required /></Field>
          <Field label="Status">
            <select className="erp-select" value={form.status || "present"} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="present">Present</option><option value="absent">Absent</option>
              <option value="late">Late</option><option value="half_day">Half Day</option><option value="leave">Leave</option>
            </select>
          </Field>
          <Field label="Check In"><input type="datetime-local" className="erp-input" value={form.check_in || ""} onChange={e => setForm({...form, check_in: e.target.value})} /></Field>
          <Field label="Check Out"><input type="datetime-local" className="erp-input" value={form.check_out || ""} onChange={e => setForm({...form, check_out: e.target.value})} /></Field>
          <Field label="Remarks"><input className="erp-input" value={form.remarks || ""} onChange={e => setForm({...form, remarks: e.target.value})} /></Field>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Update" : "Save"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
