"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
// ১. api এবং ENDPOINTS ইমপোর্ট আপনার নতুন api.ts অনুযায়ী
import api, { ENDPOINTS } from "@/lib/api"; 
import { Modal, PageHeader, Badge, Spinner, EmptyState, Field, ActionBtns, SearchBar } from "@/components/ui";
import { fmt } from "@/lib/utils";
import toast from "react-hot-toast";

export default function EmployeesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({
    employee_code: "", full_name: "", department: "", designation: "",
    employment_type: "permanent", joining_date: "", phone: "", email: "",
    basic_salary: "", nid: "", bank_name: "", bank_account: ""
  });

  const load = async () => {
    setLoading(true);
    try {
      // ২. ENDPOINTS স্ট্রাকচার ফিক্স করা হয়েছে
      const res = await api.get(ENDPOINTS.employees.list());
      setItems(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch { 
      toast.error("Failed to load employees"); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { 
    setEditing(null); 
    setForm({ 
      employee_code: "", full_name: "", department: "", designation: "", 
      employment_type: "permanent", joining_date: "", phone: "", email: "", 
      basic_salary: "", nid: "", bank_name: "", bank_account: "" 
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
        await api.patch(ENDPOINTS.employees.detail(editing.id), form); 
        toast.success("Updated successfully!"); 
      }
      else { 
        await api.post(ENDPOINTS.employees.create(), form); 
        toast.success("Employee created successfully!"); 
      }
      setShowModal(false); 
      load();
    } catch (err: any) { 
      toast.error(err?.response?.data?.detail || "An error occurred"); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try { 
      await api.delete(ENDPOINTS.employees.detail(id)); 
      toast.success("Deleted!"); 
      load(); 
    }
    catch { 
      toast.error("Delete failed"); 
    }
  };

  const filtered = items.filter((i) =>
    Object.values(i).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <PageHeader title="Employees" subtitle="Manage all employee records" onAdd={openAdd} />
      
      <div className="erp-card">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, code or department..." />
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState /> : (
          <div className="overflow-x-auto">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Phone</th>
                  <th>Salary</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>
                    <td>{item.employee_code}</td>
                    <td className="font-medium">{item.full_name}</td>
                    <td>{item.department}</td>
                    <td>{item.designation}</td>
                    <td>{item.phone}</td>
                    <td>{item.basic_salary}</td>
                    <td><Badge status={item.employment_type} /></td>
                    <td><Badge status={item.is_active ? "active" : "inactive"} /></td>
                    <td>
                      <div className="flex justify-end">
                        <ActionBtns onEdit={() => openEdit(item)} onDelete={() => handleDelete(item.id)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Employee Information" : "Add New Employee"} size="lg">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Employee Code" required>
            <input className="erp-input" value={form.employee_code || ""} onChange={e => setForm({...form, employee_code: e.target.value})} required />
          </Field>
          
          <Field label="Full Name" required>
            <input className="erp-input" value={form.full_name || ""} onChange={e => setForm({...form, full_name: e.target.value})} required />
          </Field>
          
          <Field label="Department">
            <input className="erp-input" value={form.department || ""} onChange={e => setForm({...form, department: e.target.value})} />
          </Field>
          
          <Field label="Designation">
            <input className="erp-input" value={form.designation || ""} onChange={e => setForm({...form, designation: e.target.value})} />
          </Field>
          
          <Field label="Employment Type">
            <select className="erp-select" value={form.employment_type || "permanent"} onChange={e => setForm({...form, employment_type: e.target.value})}>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="probation">Probation</option>
              <option value="intern">Intern</option>
            </select>
          </Field>
          
          <Field label="Joining Date">
            <input type="date" className="erp-input" value={form.joining_date || ""} onChange={e => setForm({...form, joining_date: e.target.value})} />
          </Field>
          
          <Field label="Phone">
            <input className="erp-input" value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} />
          </Field>
          
          <Field label="Email">
            <input type="email" className="erp-input" value={form.email || ""} onChange={e => setForm({...form, email: e.target.value})} />
          </Field>
          
          <Field label="Basic Salary">
            <input type="number" className="erp-input" value={form.basic_salary || ""} onChange={e => setForm({...form, basic_salary: e.target.value})} />
          </Field>
          
          <Field label="NID">
            <input className="erp-input" value={form.nid || ""} onChange={e => setForm({...form, nid: e.target.value})} />
          </Field>
          
          <Field label="Bank Name">
            <input className="erp-input" value={form.bank_name || ""} onChange={e => setForm({...form, bank_name: e.target.value})} />
          </Field>
          
          <Field label="Bank Account">
            <input className="erp-input" value={form.bank_account || ""} onChange={e => setForm({...form, bank_account: e.target.value})} />
          </Field>
          
          <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t mt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? "Update Employee" : "Save Employee"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}