import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Tags } from 'lucide-react'
import { adminApi, categoryApi } from '@/services'
import type { Category } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { useModal } from '@/hooks/useModal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

interface CategoryForm {
  name: string
  description: string
  icon: string
  image: string
  sortOrder: number
  isActive: boolean
}

const EMPTY: CategoryForm = { name: '', description: '', icon: '', image: '', sortOrder: 0, isActive: true }

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<CategoryForm>(EMPTY)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Category | null>(null)
  const editor = useModal()
  const removeModal = useModal()

  const load = () => {
    setLoading(true)
    categoryApi
      .list()
      .then(({ data }) => setCategories(data.categories))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: categories.length })
    editor.open()
  }

  const openEdit = (c: Category) => {
    setEditing(c)
    setForm({
      name: c.name,
      description: c.description ?? '',
      icon: c.icon ?? '',
      image: c.image ?? '',
      sortOrder: c.sortOrder,
      isActive: c.isActive,
    })
    editor.open()
  }

  const onSubmit = async () => {
    setSaving(true)
    const slug = form.name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    const payload = {
      name: form.name,
      slug,
      description: form.description || undefined,
      icon: form.icon || undefined,
      image: form.image || undefined,
      sortOrder: Number(form.sortOrder),
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await adminApi.updateCategory(editing._id, payload)
        toastSuccess('Category updated')
      } else {
        await adminApi.createCategory(payload)
        toastSuccess('Category created')
      }
      editor.close()
      load()
    } catch (err) {
      toastError(err, 'Could not save category')
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    try {
      await adminApi.deleteCategory(removeTarget._id)
      toastSuccess('Category deleted')
      load()
    } catch (err) {
      toastError(err, 'Could not delete category')
    } finally {
      removeModal.close()
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Categories</h1>
          <p className="mt-1 text-sm text-gray-400">Organise products into browsable aisles.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories" description="Create your first category to start organising products." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card overflow-hidden">
              <div className="flex gap-3 p-4">
                {c.image ? (
                  <img src={c.image} alt="" className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-leaf-500/10 text-2xl">{c.icon ?? '🛒'}</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-display text-base font-extrabold text-white">{c.name}</p>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${c.isActive ? 'bg-leaf-500' : 'bg-gray-600'}`} title={c.isActive ? 'Active' : 'Inactive'} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-400">{c.description || '—'}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">Slug: {c.slug}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t border-white/10 p-3">
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
          ))}
        </div>
      )}

      <Modal
        open={editor.isOpen}
        onClose={editor.close}
        title={editing ? 'Edit Category' : 'Add Category'}
        footer={
          <>
            <Button variant="ghost" onClick={editor.close}>Cancel</Button>
            <Button onClick={onSubmit} loading={saving}>{editing ? 'Save Changes' : 'Create Category'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <div className="sm:col-span-2">
            <Textarea label="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <Input label="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <Input label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-leaf-500" />
            Category is active
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={removeModal.isOpen} onClose={removeModal.close}
        title="Delete this category?"
        description={`"${removeTarget?.name ?? ''}" will be removed. Products in it will need a new category.`}
        confirmLabel="Delete"
        onConfirm={confirmRemove}
      />
    </div>
  )
}