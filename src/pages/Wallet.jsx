import { useEffect, useState } from 'react'
import { Wallet as WalletIcon, Copy, ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  listenWalletTransactions,
  submitDeposit,
  submitWithdrawal,
  listenDeposits,
  listenWithdrawals,
  isSupabaseConfigured,
} from '../lib/supabase'
import { formatMGA, formatDateTime } from '../utils/formatCurrency'
import { isPositiveAmount, isValidPhone } from '../utils/validators'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, BackendNotConfigured } from '../components/States'

const AIRTEL_NUMBER = import.meta.env.VITE_AIRTEL_MONEY_NUMBER || '0338366605'
const MIN_WITHDRAWAL = Number(import.meta.env.VITE_MIN_WITHDRAWAL_MGA) || 5000

export default function Wallet() {
  const { user, profile } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState('history')
  const [transactions, setTransactions] = useState(null)
  const [deposits, setDeposits] = useState([])
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = listenWalletTransactions(user.uid, setTransactions)
    return unsub
  }, [user])

  useEffect(() => {
    if (!user) return
    const u1 = listenDeposits(user.uid, setDeposits)
    const u2 = listenWithdrawals(user.uid, setWithdrawals)
    return () => {
      u1()
      u2()
    }
  }, [user])

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Wallet</h1>
        <div className="mt-4 hud-card p-6">
          <div className="flex items-center gap-2 text-ink-faint">
            <WalletIcon size={16} className="text-edge-cyan" />
            <span className="text-xs uppercase tracking-wider">Available balance</span>
          </div>
          <p className="mt-2 stat-mono text-4xl font-bold text-ink glow-text">{formatMGA(profile?.walletBalance)}</p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/5 bg-white/[0.02] p-1">
        {[
          { id: 'deposit', label: 'Add money' },
          { id: 'withdraw', label: 'Withdraw' },
          { id: 'history', label: 'History' },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-display font-semibold transition-colors ${
              tab === tabItem.id ? 'bg-gradient-to-r from-edge-blue to-edge text-white shadow-glow' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {!isSupabaseConfigured ? (
        <BackendNotConfigured feature="Wallet" />
      ) : tab === 'deposit' ? (
        <DepositPanel userId={user?.uid} deposits={deposits} />
      ) : tab === 'withdraw' ? (
        <WithdrawPanel userId={user?.uid} balance={profile?.walletBalance || 0} withdrawals={withdrawals} />
      ) : (
        <HistoryPanel transactions={transactions} />
      )}
    </div>
  )
}

function DepositPanel({ userId, deposits }) {
  const { showToast } = useToast()
  const [amount, setAmount] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function copyNumber() {
    navigator.clipboard.writeText(AIRTEL_NUMBER)
    showToast('Number copied', 'success', 1500)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isPositiveAmount(amount)) return showToast('Enter a valid amount.', 'error')
    if (!referenceId.trim()) return showToast('Enter the Airtel Money transaction reference.', 'error')
    if (!isValidPhone(senderPhone)) return showToast('Enter a valid sender phone number.', 'error')

    setSubmitting(true)
    try {
      await submitDeposit({ userId, amount: Number(amount), referenceId: referenceId.trim(), senderPhone: senderPhone.trim() })
      showToast('Deposit submitted — pending admin verification.', 'success')
      setAmount('')
      setReferenceId('')
      setSenderPhone('')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="hud-card p-5">
        <p className="font-display text-sm font-semibold text-ink">Manual Airtel Money deposit</p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-sm text-ink-muted">
          <li>Send the amount to the number below via Airtel Money.</li>
          <li>Enter the transaction/reference number and the amount below.</li>
          <li>Submit — an admin will verify and credit your wallet.</li>
        </ol>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-edge-blue/30 bg-edge-blue/5 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint">Admin Airtel Money number</p>
            <p className="stat-mono text-lg font-bold text-edge-cyan">{AIRTEL_NUMBER}</p>
          </div>
          <button onClick={copyNumber} className="btn-secondary px-3 py-2 text-xs">
            <Copy size={14} />
          </button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          This number is not connected to an automated payment API — deposits are verified manually by an admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="hud-card space-y-3 p-5">
        <p className="font-display text-sm font-semibold text-ink">Submit deposit proof</p>
        <input type="number" min="1" placeholder="Amount (MGA)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
        <input placeholder="Airtel transaction/reference ID" value={referenceId} onChange={(e) => setReferenceId(e.target.value)} className="input-field" />
        <input placeholder="Sender phone number" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className="input-field" />
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <ArrowDownCircle size={16} /> {submitting ? 'Submitting…' : 'Submit deposit'}
        </button>
      </form>

      <RequestList title="Your deposit requests" items={deposits} amountKey="amount" positive />
    </div>
  )
}

function WithdrawPanel({ userId, balance, withdrawals }) {
  const { showToast } = useToast()
  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [accountName, setAccountName] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isPositiveAmount(amount)) return showToast('Enter a valid amount.', 'error')
    if (Number(amount) < MIN_WITHDRAWAL) return showToast(`Minimum withdrawal is ${formatMGA(MIN_WITHDRAWAL)}.`, 'error')
    if (Number(amount) > balance) return showToast('Amount exceeds your wallet balance.', 'error')
    if (!isValidPhone(phone)) return showToast('Enter a valid Airtel Money phone number.', 'error')
    if (!accountName.trim()) return showToast('Enter the account name.', 'error')

    setSubmitting(true)
    try {
      await submitWithdrawal({ userId, amount: Number(amount), phone: phone.trim(), accountName: accountName.trim(), note })
      showToast('Withdrawal request submitted — pending admin approval.', 'success')
      setAmount('')
      setPhone('')
      setAccountName('')
      setNote('')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">
        Minimum withdrawal: <span className="stat-mono text-ink">{formatMGA(MIN_WITHDRAWAL)}</span>. Requests are reviewed and paid manually by an admin — nothing is marked paid automatically.
      </p>

      <form onSubmit={handleSubmit} className="hud-card space-y-3 p-5">
        <p className="font-display text-sm font-semibold text-ink">Request withdrawal</p>
        <input type="number" min="1" placeholder="Amount (MGA)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" />
        <input placeholder="Airtel Money phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
        <input placeholder="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="input-field" />
        <textarea placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="input-field resize-none" rows={2} />
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          <ArrowUpCircle size={16} /> {submitting ? 'Submitting…' : 'Request withdrawal'}
        </button>
      </form>

      <RequestList title="Your withdrawal requests" items={withdrawals} amountKey="amount" />
    </div>
  )
}

function RequestList({ title, items, amountKey, positive }) {
  return (
    <div>
      <p className="mb-2 font-display text-sm font-semibold text-ink">{title}</p>
      {items.length === 0 ? (
        <EmptyState title="Nothing submitted yet" />
      ) : (
        <div className="hud-card divide-y divide-white/5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className={`stat-mono text-sm font-semibold ${positive ? 'text-win' : 'text-ink'}`}>{formatMGA(item[amountKey])}</p>
                <p className="text-xs text-ink-faint">{formatDateTime(item.createdAt)}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryPanel({ transactions }) {
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-ink">
        <History size={16} className="text-edge-cyan" /> Transaction history
      </p>
      {transactions === null ? (
        <div className="hud-card h-40 animate-pulse-slow" />
      ) : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" description="Deposits, entries, winnings, and withdrawals will show up here." />
      ) : (
        <div className="hud-card divide-y divide-white/5">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm text-ink">{txn.description}</p>
                <p className="text-xs text-ink-faint">{formatDateTime(txn.createdAt)} · {txn.type?.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className={`stat-mono text-sm font-semibold ${txn.amount < 0 ? 'text-loss' : 'text-win'}`}>
                  {txn.amount < 0 ? '' : '+'}
                  {formatMGA(txn.amount)}
                </p>
                <StatusBadge status={txn.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
