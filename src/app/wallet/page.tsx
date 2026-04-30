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

const EMPTY_TX: any = { wallet: '', transaction_type: 'commission', amount: '', description: '', status: 'pending' }

export default function WalletPage() {
  const [wallets, setWallets] = useState<any[]>([])
  const [txs, setTxs] = useState<any[]>([])
  const [tab, setTab] = useState<'wallets'|'transactions'>('wallets')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add'|'view'|null>(null)
  const [form, setForm] = useState<any>(EMPTY_TX)
  const [selected, setSelected] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetchList(ENDPOINTS.wallets.list()),
      fetchList(ENDPOINTS.walletTx.list()),
    ]).then(([w, t]) => { setWallets(w.data); setTxs(t.data) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])
  const f = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      await createItem(ENDPOINTS.walletTx.create(), form)
      toast.success('Transaction created')
      setModal(null); load()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  const TX_TYPES = ['commission','incentive','bonus','dividend','withdrawal','loan_deduction','survival_fund','ta_da','other']

  return (
    <AppShell>
      <PageHeader title="Wallet Management" subtitle="Officer and investor wallets"
        onAdd={() => { setForm(EMPTY_TX); setModal('add') }} addLabel="New Transaction" />
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {(['wallets','transactions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding:'6px 16px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:500, fontSize:13,
              background: tab===t ? '#0369a1' : 'white', color: tab===t ? 'white' : '#334155',
              boxShadow: tab===t ? 'none' : '0 0 0 1px #e2e8f0' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? <Spinner /> : tab === 'wallets' ? (
          wallets.length === 0 ? <Empty /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>ID</th><th>User</th><th>Type</th><th>Balance</th><th>Loan Balance</th><th>Actions</th></tr></thead>
              <tbody>{wallets.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td><td>{item.user}</td><td>{item.wallet_type}</td>
                  <td style={{fontWeight:600,color:'#059669'}}>{fmt.currency(item.balance)}</td>
                  <td style={{color:item.loan_balance>0?'#ef4444':'inherit'}}>{fmt.currency(item.loan_balance)}</td>
                  <td><button onClick={() => { setSelected(item); setModal('view') }} style={{background:'#e0f2fe',color:'#0369a1',border:'none',padding:'4px 8px',borderRadius:6,cursor:'pointer'}}><FiEye size={13}/></button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )
        ) : (
          txs.length === 0 ? <Empty /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Wallet</th><th>Type</th><th>Amount</th><th>Before</th><th>After</th><th>Status</th></tr></thead>
              <tbody>{txs.map(item => (
                <tr key={item.id}>
                  <td>{item.wallet}</td><td>{item.transaction_type?.replace(/_/g,' ')}</td>
                  <td style={{fontWeight:600}}>{fmt.currency(item.amount)}</td>
                  <td>{fmt.currency(item.balance_before)}</td>
                  <td>{fmt.currency(item.balance_after)}</td>
                  <td><Badge status={item.status} /></td>
                </tr>
              ))}</tbody>
            </table></div>
          )
        )}
      </div>

      {modal === 'add' && (
        <Modal title="New Wallet Transaction" onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="form-grid">
              <div><label className="label">Wallet ID *</label><input className="input" type="number" value={form.wallet} onChange={f('wallet')} /></div>
              <div><label className="label">Type *</label>
                <select className="input" value={form.transaction_type} onChange={f('transaction_type')}>
                  {TX_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div><label className="label">Amount *</label><input className="input" type="number" value={form.amount} onChange={f('amount')} /></div>
              <div><label className="label">Booking ID</label><input className="input" type="number" value={form.booking||''} onChange={f('booking')} /></div>
              <div><label className="label">Status</label>
                <select className="input" value={form.status} onChange={f('status')}>
                  {['pending','approved','rejected','paid'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="full"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={f('description')} /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </Modal>
      )}
      {modal === 'view' && selected && (
        <Modal title="Wallet Details" onClose={() => setModal(null)}>
          <div className="modal-body">
            <div className="form-grid">
              {Object.entries(selected).map(([k,v]) => (
                <div key={k}><div className="label">{k.replace(/_/g,' ')}</div><div style={{fontSize:14,fontWeight:500}}>{String(v)||'—'}</div></div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
