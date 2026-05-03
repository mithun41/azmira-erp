"use client";
import { ReactNode } from "react";
import { MdClose, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { cn, STATUS_COLORS } from "@/lib/utils";

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}
export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={cn("bg-white rounded-2xl shadow-2xl w-full overflow-hidden", sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <MdClose className="text-xl text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Page Header ──────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  extra?: ReactNode;
}
export function PageHeader({ title, subtitle, onAdd, addLabel = "Add New", extra }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {onAdd && (
          <button onClick={onAdd} className="btn-primary">
            <MdAdd className="text-lg" /> {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  sub?: string;
}
export function StatCard({ label, value, icon, color = "bg-primary-50 text-primary-600", sub }: StatCardProps) {
  return (
    <div className="erp-card flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl", color)}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status }: { status: string }) {
  return (
    <span className={cn("badge", STATUS_COLORS[status] || STATUS_COLORS.default)}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ message = "No data found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-5xl mb-3">📭</div>
      <p>{message}</p>
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}
export function Field({ label, required, children, error }: FieldProps) {
  return (
    <div>
      <label className="erp-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Table Action Buttons ─────────────────────────────────────────────────────
interface ActionBtnProps { onEdit?: () => void; onDelete?: () => void; }
export function ActionBtns({ onEdit, onDelete }: ActionBtnProps) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button onClick={onEdit}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <MdEdit className="text-base" />
        </button>
      )}
      {onDelete && (
        <button onClick={onDelete}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <MdDelete className="text-base" />
        </button>
      )}
    </div>
  );
}

// ─── Search + Filter Bar ──────────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="erp-input max-w-xs"
    />
  );
}
