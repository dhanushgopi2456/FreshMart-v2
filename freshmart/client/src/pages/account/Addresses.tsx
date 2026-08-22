import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { MapPin, Plus, Pencil, Trash2, Star } from 'lucide-react'
import { accountApi, type AddressInput } from '@/services'
import type { Address } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton } from '@/components/ui/Feedback'
import { useModal } from '@/hooks/useModal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Valid phone required'),
  addressLine: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[0-9]{6}$/, '6-digit PIN required'),
  landmark: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Address | null>(null)
  const [saving, setSaving] = useState(false)
  const editor = useModal()
  const removeModal = useModal()
  const [removeTarget, setRemoveTarget] = useState<Address | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const load = () => accountApi.addresses().then(({ data }) => setAddresses(data.addresses))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setEditing(null)
    reset({ fullName: '', phone: '', addressLine: '', city: '', state: '', postalCode: '', landmark: '' })
    editor.open()
  }

  const openEdit = (a: Address) => {
    setEditing(a)
    reset({ ...a })
    editor.open()
  }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      if (editing) {
        const { data: res } = await accountApi.updateAddress(editing._id, data as AddressInput)
        setAddresses(res.addresses)
        toastSuccess('Address updated')
      } else {
        const { data: res } = await accountApi.addAddress(data as AddressInput)
        setAddresses(res.addresses)
        toastSuccess('Address added')
      }
      editor.close()
    } catch (err) {
      toastError(err, 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  const setDefault = async (a: Address) => {
    try {
      const { data: res } = await accountApi.updateAddress(a._id, { ...a, isDefault: true })
      setAddresses(res.addresses)
      toastSuccess('Default address updated')
    } catch (err) {
      toastError(err, 'Could not update')
    }
  }

  const confirmRemove = () => {
    if (!removeTarget) return
    accountApi
      .deleteAddress(removeTarget._id)
      .then(({ data }) => {
        setAddresses(data.addresses)
        toastSuccess('Address removed')
      })
      .catch((err) => toastError(err, 'Could not remove'))
      .finally(removeModal.close)
  }

  if (loading) {
    return (
      <div className="container-fm pt-24 pb-16">
        <div className="section-title mb-8">Saved Addresses</div>
        <Skeleton className="h-40" />
      </div>
    )
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Saved Addresses</h1>
          <p className="mt-1 text-sm text-gray-400">Manage the addresses used at checkout.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center p-12 text-center">
          <MapPin className="h-10 w-10 text-gray-600" />
          <p className="mt-3 font-semibold text-white">No addresses yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first delivery address to continue.</p>
          <Button onClick={openAdd} className="mt-5">
            <Plus className="h-4 w-4" /> Add New Address
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {addresses.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card relative p-5">
              {a.isDefault && (
                <span className="absolute -top-2.5 right-4 flex items-center gap-1 rounded-full bg-leaf-500 px-3 py-1 text-[10px] font-bold text-leaf-950">
                  <Star className="h-3 w-3 fill-current" /> DEFAULT
                </span>
              )}
              <p className="font-bold text-white">{a.fullName}</p>
              <p className="mt-1 text-sm text-gray-400">{a.addressLine}</p>
              <p className="text-sm text-gray-400">
                {a.city}, {a.state} {a.postalCode}
              </p>
              {a.landmark && <p className="mt-1 text-xs text-gray-500">Near {a.landmark}</p>}
              <p className="mt-1 text-sm text-gray-400">{a.phone}</p>
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                {!a.isDefault && (
                  <button onClick={() => setDefault(a)} className="text-xs font-semibold text-leaf-500 hover:text-leaf-400">
                    Set default
                  </button>
                )}
                <div className="ml-auto flex gap-2">
                  <button onClick={() => openEdit(a)} className="rounded-lg bg-white/5 p-2 text-gray-400 hover:text-white" aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setRemoveTarget(a)
                      removeModal.open()
                    }}
                    className="rounded-lg bg-white/5 p-2 text-gray-400 hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={editor.isOpen}
        onClose={editor.close}
        title={editing ? 'Edit Address' : 'Add Address'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="a-name" label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
            <Input id="a-phone" label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
          <Textarea id="a-line" label="Address" rows={2} error={errors.addressLine?.message} {...register('addressLine')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input id="a-city" label="City" error={errors.city?.message} {...register('city')} />
            <Input id="a-state" label="State" error={errors.state?.message} {...register('state')} />
            <Input id="a-pin" label="PIN Code" error={errors.postalCode?.message} {...register('postalCode')} />
          </div>
          <Input id="a-landmark" label="Landmark (optional)" {...register('landmark')} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={editor.close}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Add Address'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={removeModal.isOpen} onClose={removeModal.close}
        title="Remove this address?"
        description={`This will remove the address for ${removeTarget?.fullName ?? ''}.`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
      />
    </div>
  )
}