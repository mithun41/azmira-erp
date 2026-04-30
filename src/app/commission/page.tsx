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

export default function CommissionPage() {
  const [commissions, setCommissions] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [tab, setTab] = useState<'commissions'|'rules'>('commissions')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add_comm'|'add_rule'|'edit_rule'|null>(null)
  const [form, setForm] = useState<any>({})
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([fetchList(ENDPOINTS.commissions.list()), fetchList(ENDPOINTS.commRules.list())])
      .then(([c, r]) => { setCommissions(c.data); setRules(r.data) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])
  const f = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add_comm') { await createItem(ENDPOINTS.commissions.create(), form); toast.success('Created') }
      else if (modal === 'add_rule') { await createItem(ENDPOINTS.commRules.create(), form); toast.success('Rule created') }
      else if (modal === 'edit_rule') { await updateItem(ENDPOINTS.commRules.detail(selected.id), form); toast.success('Rule updated') }
      setModal(null); load()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const delRule = async (id: number) => {
    if (!confirm('Delete rule?')) return
    try { await deleteItem(ENDPOINTS.commRules.detail(id)); toast.success('Deleted'); load() } catch { toast.error('Failed') }
  }

  return (
    <AppShell>
      <PageHeader title="Commission" subtitle="Commission records and rules"
        onAdd={() => { setForm(tab==='commissions' ? {generation:1,commission_rate:0,base_amount:0,commission_amount:0,status:'pending'} : {generation:1,percentage:0,is_active:true}); setModal(tab==='commissions'?'add_comm':'add_rule') }}
        addLabel={tab==='commissions' ? 'New Commission' : 'New Rule'} />
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['commissions','rules'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:500, fontSize:13, background: tab===t ? '#0369a1' : 'white', color: tab===t ? 'white' : '#334155', boxShadow: tab===t ? 'none' : '0 0 0 1px #e2e8f0' }}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>
      <div className="card">
        {loading ? <Spinner /> : tab === 'commissions' ? (
          commissions.length === 0 ? <Empty /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Officer</th><th>Booking</th><th>Generation</th><th>Rate</th><th>Amount</th><th>Cash?</th><th>Status</th><th>Wallet Hit</th></tr></thead>
              <tbody>{commissions.map(item => (
                <tr key={item.id}>
                  <td>{item.marketing_officer}</td><td>{item.booking}</td>
                  <td style={{textAlign:'center'}}>Gen {item.generation}</td>
                  <td>{item.commission_rate}%</td>
                  <td style={{fontWeight:600,color:'#059669'}}>{fmt.currency(item.commission_amount)}</td>
                  <td><Badge status={item.is_cash_payment ? 'active' : 'pending'} /></td>
                  <td><Badge status={item.status} /></td>
                  <td><Badge status={item.wallet_hit ? 'active' : 'pending'} /></td>
                </tr>
              ))}</tbody>
            </table></div>
          )
        ) : (
          rules.length === 0 ? <Empty /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Rule Name</th><th>Project</th><th>Generation</th><th>Percentage</th><th>Active</th><th>Effective From</th><th>Actions</th></tr></thead>
              <tbody>{rules.map(item => (
                <tr key={item.id}>
                  <td style={{fontWeight:500}}>{item.rule_name}</td>
                  <td>{item.project || '—'}</td>
                  <td style={{textAlign:'center'}}>Gen {item.generation}</td>
                  <td style={{fontWeight:600,color:'#0369a1'}}>{item.percentage}%</td>
                  <td><Badge status={item.is_active ? 'active' : 'cancelled'} /></td>
                  <td>{fmt.date(item.effective_from)}</td>
                  <td><div style={{display:'flex',gap:6}}>
                    <button onClick={() => { setSelected(item); setForm(item); setModal('edit_rule') }} style={{background:'#fef9c3',color:'#92400e',border:'none',padding:'4px 8px',borderRadius:6,cursor:'pointer'}}><FiEdit2 size={13}/></button>
                    <button onClick={() => delRule(item.id)} className="btn-danger" style={{padding:'4px 8px'}}><FiTrash2 size={13}/></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table></div>
          )
        )}
      </div>

      {(modal === 'add_rule' || modal === 'edit_rule') && (
        <Modal title={modal === 'add_rule' ? 'New Commission Rule' : 'Edit Rule'} onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Rule Name *</label><input className="input" value={form.rule_name||''} onChange={f('rule_name')} /></div>
              <div><label className="label">Generation *</label><input className="input" type="number" value={form.generation||1} onChange={f('generation')} /></div>
              <div><label className="label">Percentage (%) *</label><input className="input" type="number" step="0.01" value={form.percentage||0} onChange={f('percentage')} /></div>
              <div><label className="label">Project ID</label><input className="input" type="number" value={form.project||''} onChange={f('project')} /></div>
              <div><label className="label">Effective From</label><input className="input" type="date" value={form.effective_from||''} onChange={f('effective_from')} /></div>
              <div><label className="label">Effective To</label><input className="input" type="date" value={form.effective_to||''} onChange={f('effective_to')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'add_comm' && (
        <Modal title="New Commission Record" onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Officer ID *</label><input className="input" type="number" value={form.marketing_officer||''} onChange={f('marketing_officer')} /></div>
              <div><label className="label">Booking ID *</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Generation</label><input className="input" type="number" value={form.generation||1} onChange={f('generation')} /></div>
              <div><label className="label">Rate (%)</label><input className="input" type="number" step="0.01" value={form.commission_rate||0} onChange={f('commission_rate')} /></div>
              <div><label className="label">Base Amount</label><input className="input" type="number" value={form.base_amount||0} onChange={f('base_amount')} /></div>
              <div><label className="label">Commission Amount</label><input className="input" type="number" value={form.commission_amount||0} onChange={f('commission_amount')} /></div>
              <div><label className="label">Status</label>
                <select className="input" value={form.status||'pending'} onChange={f('status')}>
                  {['pending','approved','paid','on_hold'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
