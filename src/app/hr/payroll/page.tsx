"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { api, ENDPOINTS } from "@/lib/api"; // ✅ fixed
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

// ✅ local formatter (utils না ছুঁয়ে)
const formatCurrency = (n: number | string) => {
  const num = Number(n);
  return isNaN(num) ? "—" : `৳ ${num.toLocaleString("en-BD")}`;
};

export default function PayrollPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const EMPTY_FORM = {
    employee: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    working_days: 26,
    present_days: "",
    basic_salary: "",
    payable_salary: "",
    loan_deduction: 0,
    net_salary: "",
    payment_status: "pending",
    payment_mode: "",
  };

  const [form, setForm] = useState<any>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(ENDPOINTS.payroll.list());
      setItems(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      toast.error("Failed to load payroll records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch(ENDPOINTS.payroll.detail(editing.id), form);
        toast.success("Payroll updated!");
      } else {
        await api.post(ENDPOINTS.payroll.create(), form);
        toast.success("Payroll created!");
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Error saving record");
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
        title="Payroll"
        subtitle="Monthly salary management"
        onAdd={() => {
          setEditing(null);
          setForm(EMPTY_FORM);
          setShowModal(true);
        }}
      />

      <div className="erp-card">
        <div className="mb-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search payroll..."
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
                  <th>Employee</th>
                  <th>Month/Year</th>
                  <th>Basic</th>
                  <th>Payable</th>
                  <th>Loan Ded.</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>

                    <td className="font-medium">
                      {item.employee_name || item.employee}
                    </td>

                    <td>
                      {item.month}/{item.year}
                    </td>

                    <td>{formatCurrency(item.basic_salary)}</td>
                    <td>{formatCurrency(item.payable_salary)}</td>

                    <td className="text-red-500">
                      -{formatCurrency(item.loan_deduction)}
                    </td>

                    <td className="font-bold text-primary">
                      {formatCurrency(item.net_salary)}
                    </td>

                    <td>
                      <Badge status={item.payment_status} />
                    </td>

                    <td>
                      <div className="flex justify-end">
                        <ActionBtns
                          onEdit={() => {
                            setEditing(item);
                            setForm(item);
                            setShowModal(true);
                          }}
                          onDelete={async () => {
                            if (!confirm("Are you sure?")) return;
                            try {
                              await api.delete(
                                ENDPOINTS.payroll.detail(item.id)
                              );
                              toast.success("Deleted");
                              load();
                            } catch {
                              toast.error("Delete failed");
                            }
                          }}
                        />
                      </div>
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
        title={editing ? "Edit Payroll Record" : "Generate Payroll"}
        size="lg"
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Field label="Employee ID" required>
            <input
              type="number"
              className="erp-input"
              value={form.employee || ""}
              onChange={(e) =>
                setForm({ ...form, employee: e.target.value })
              }
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Month">
              <input
                type="number"
                className="erp-input"
                value={form.month}
                onChange={(e) =>
                  setForm({ ...form, month: e.target.value })
                }
              />
            </Field>

            <Field label="Year">
              <input
                type="number"
                className="erp-input"
                value={form.year}
                onChange={(e) =>
                  setForm({ ...form, year: e.target.value })
                }
              />
            </Field>
          </div>

          <Field label="Basic Salary">
            <input
              type="number"
              className="erp-input"
              value={form.basic_salary}
              onChange={(e) =>
                setForm({ ...form, basic_salary: e.target.value })
              }
            />
          </Field>

          <Field label="Payable Salary">
            <input
              type="number"
              className="erp-input"
              value={form.payable_salary}
              onChange={(e) =>
                setForm({ ...form, payable_salary: e.target.value })
              }
            />
          </Field>

          <Field label="Loan Deduction">
            <input
              type="number"
              className="erp-input"
              value={form.loan_deduction}
              onChange={(e) =>
                setForm({ ...form, loan_deduction: e.target.value })
              }
            />
          </Field>

          <Field label="Net Salary">
            <input
              type="number"
              className="erp-input"
              value={form.net_salary}
              onChange={(e) =>
                setForm({ ...form, net_salary: e.target.value })
              }
            />
          </Field>

          <Field label="Payment Status">
            <select
              className="erp-select"
              value={form.payment_status}
              onChange={(e) =>
                setForm({ ...form, payment_status: e.target.value })
              }
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </Field>

          <Field label="Payment Mode">
            <input
              className="erp-input"
              value={form.payment_mode}
              onChange={(e) =>
                setForm({ ...form, payment_mode: e.target.value })
              }
            />
          </Field>

          <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary">
              {editing ? "Update Payroll" : "Save & Generate"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}