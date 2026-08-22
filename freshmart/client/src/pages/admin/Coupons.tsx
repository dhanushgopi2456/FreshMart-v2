import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, TicketPercent } from 'lucide-react'
import { adminApi } from '@/services'
import type { Coupon } from '@/types'
import { formatINR, formatDate, classNames } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { useModal } from '@/hooks/useModal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

interface CouponForm {
  code: string
  description: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue: number
  maxDiscount: string
  maxUses: string
  expiresAt: string
  isActive: boolean
}

const EMPTY: CouponForm = {
  code: '',
  description: '',
  type: 'PERCENTAGE',
  value: 10,
  minOrderValue: 0,
  maxDiscount: '',
  maxUses: '',
  expiresAt: '',
  isActive: true,
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<CouponForm>(EMPTY)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Coupon | null>(null)
  const editor = useModal()
  const removeModal = useModal()

  const load = () => {
    setLoading(true)
    adminApi.coupons().then(({ data }) => setCoupons(data.coupons)).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY)
    editor.open()
  }

  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code,
      description: c.description ?? '',
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue,
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
      isActive: c.isActive,
    })
    editor.open()
  }

  const onSubmit = async () => {
    setSaving(true)
    const payload = {
      code: form.code,
      description: form.description || undefined,
      type: form.type,
      value: Number(form.value),
      minOrderValue: Number(form.minOrderValue),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await adminApi.updateCoupon(editing._id, payload)
        toastSuccess('Coupon updated')
      } else {
        await adminApi.createCoupon(payload)
        toastSuccess('Coupon created')
      }
      editor.close()
      load()
    } catch (err) {
      toastError(err, 'Could not save coupon')
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    try {
      await adminApi.deleteCoupon(removeTarget._id)
      toastSuccess('Coupon deleted')
      load()
    } catch (err) {
      toastError(err, 'Could not delete')
    } finally {
      removeModal.close()
    }
  }

  const isExpired = (c: Coupon) => c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Coupons</h1>
          <p className="mt-1 text-sm text-gray-400">Promotions applied at checkout.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState icon={TicketPercent} title="No coupons" description="Create a coupon to start driving orders." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c, i) => {
            const expired = isExpired(c)
            return (
              <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card relative overflow-hidden p-5">
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: !c.isActive || expired ? '#f87171' : 'linear-gradient(90deg,#00d46a,#7dd3fc)' }} />
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-leaf-500/10">
                    <TicketPercent className="h-5 w-5 text-leaf-500" />
                  </div>
                  <span className={classNames('rounded-full px-2.5 py-1 text-[10px] font-bold', expired ? 'bg-red-500/10 text-red-400' : c.isActive ? 'bg-leaf-500/10 text-leaf-500' : 'bg-gray-500/10 text-gray-400')}>
                    {expired ? 'EXPIRED' : c.isActive ? 'ACTIVE' : 'PAUSED'}
                  </span>
                </div>
                <p className="mt-4 font-display text-2xl font-extrabold tracking-wide text-white">{c.code}</p>
                <p className="mt-1 line-clamp-1 text-xs text-gray-400">{c.description || '—'}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-bold text-leaf-500">
                    {c.type === 'PERCENTAGE' ? `${c.value}% off` : `${formatINR(c.value)} off`}
                  </span>
                  <span className="text-xs text-gray-500">min {formatINR(c.minOrderValue)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{c.usedCount}/{c.maxUses ?? '∞'} used</span>
                  <span>{c.expiresAt ? `until ${formatDate(c.expiresAt)}` : 'no expiry'}</span>
                </div>
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                  <Button size="sm" variant="outline" onClick={() => openEdit(c)} className="flex-1">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => {
                      setRemoveTarget(c)
                      removeModal.open()
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Modal
        open={editor.isOpen}
        onClose={editor.close}
        title={editing ? 'Edit Coupon' : 'New Coupon'}
        footer={
          <>
            <Button variant="ghost" onClick={editor.close}>Cancel</Button>
            <Button onClick={onSubmit} loading={saving}>{editing ? 'Save Changes' : 'Create Coupon'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="FRESH20" />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CouponForm['type'] })}
            options={[
              { value: 'PERCENTAGE', label: 'Percentage (%)' },
              { value: 'FIXED', label: 'Fixed amount (₹)' },
            ]}
          />
          <div className="sm:col-span-2">
            <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Input label={form.type === 'PERCENTAGE' ? 'Value (%)' : 'Value (₹)'} type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          <Input label="Min Order Value (₹)" type="number" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })} />
          <Input label="Max Discount (₹)" type="number" placeholder="Optional" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
          <Input label="Max Uses" type="number" placeholder="Unlimited" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          <Input label="Expires At" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-leaf-500" />
            Coupon is active
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={removeModal.isOpen} onClose={removeModal.close}
        title="Delete this coupon?"
        description={`${removeTarget?.code ?? ''} will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmRemove}
      />
    </div>
  )
}