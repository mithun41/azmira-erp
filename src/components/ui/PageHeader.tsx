import { FiPlus } from 'react-icons/fi'
interface Props { title: string; subtitle?: string; onAdd?: () => void; addLabel?: string }
export default function PageHeader({ title, subtitle, onAdd, addLabel = 'Add New' }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {onAdd && <button className="btn-primary" onClick={onAdd}><FiPlus size={15}/>{addLabel}</button>}
    </div>
  )
}
