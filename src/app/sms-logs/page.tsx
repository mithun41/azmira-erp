"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import api, { ENDPOINTS } from "@/lib/api";
import {
  Modal,
  PageHeader,
  Badge,
  Spinner,
  EmptyState,
  Field,
  ActionBtns,
  SearchBar,
} from "@/components/ui";
import toast from "react-hot-toast";

export default function SMSLogsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [form, setForm] = useState<any>({
    recipient_phone: "",
    sms_type: "",
    message: "",
  });

  const ep = ENDPOINTS.smsLogs;

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(ep.list());
      setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({
      recipient_phone: "",
      sms_type: "",
      message: "",
    });
    setShowModal(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm(item);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.patch(ep.detail(editing.id), form);
        toast.success("Updated!");
      } else {
        await api.post(ep.create(), form);
        toast.success("Created!");
      }

      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(
        err?.response?.data
          ? JSON.stringify(err.response.data)
          : "Error occurred"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this record?")) return;

    try {
      await api.delete(ep.detail(id));
      toast.success("Deleted!");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = items.filter((i) =>
    Object.values(i).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <DashboardLayout>
      <PageHeader
        title="SMS Logs"
        subtitle="View all SMS notifications"
        onAdd={openAdd}
      />

      <div className="erp-card">
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search SMS Logs..."
          />
        </div>

        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Recipient Phone</th>
                  <th>Sms Type</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>
                    <td>{item.recipient_phone ?? "—"}</td>
                    <td>{item.sms_type ?? "—"}</td>
                    <td>
                      <Badge status={String(item.status)} />
                    </td>
                    <td>{item.sent_at ?? "—"}</td>
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit SMS Logs" : "Add SMS Logs"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <Field label="Phone" required>
            <input
              type="text"
              className="erp-input"
              value={form.recipient_phone || ""}
              onChange={(e) =>
                setForm({ ...form, recipient_phone: e.target.value })
              }
              required
            />
          </Field>

          <Field label="Type" required>
            <input
              type="text"
              className="erp-input"
              value={form.sms_type || ""}
              onChange={(e) =>
                setForm({ ...form, sms_type: e.target.value })
              }
              required
            />
          </Field>

          <div className="col-span-2">
  <Field label="Message">
    <textarea
      className="erp-input"
      rows={3}
      value={form.message || ""}
      onChange={(e) =>
        setForm({ ...form, message: e.target.value })
      }
    />
  </Field>
</div>

          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t mt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}