import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Package, Star } from 'lucide-react'
import { adminApi, categoryApi } from '@/services'
import type { Product, Category, ProductFilters } from '@/types'
import { formatINR, classNames } from '@/utils/format'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Skeleton, EmptyState } from '@/components/ui/Feedback'
import { useModal } from '@/hooks/useModal'
import { toastSuccess } from '@/store/toastStore'
import { toastError } from '@/services/api'

interface ProductForm {
  name: string
  category: string
  brand: string
  price: number
  discountPrice: number | null
  stock: number
  minStock: number
  sku: string
  unit: string
  description: string
  images: string
  isFeatured: boolean
  isBestSeller: boolean
}

const EMPTY: ProductForm = {
  name: '',
  category: '',
  brand: '',
  price: 0,
  discountPrice: null,
  stock: 0,
  minStock: 5,
  sku: '',
  unit: 'item',
  description: '',
  images: '',
  isFeatured: false,
  isBestSeller: false,
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ProductFilters>({ page: 1, limit: 10 })
  const [totalPages, setTotalPages] = useState(1)
  const [form, setForm] = useState<ProductForm>(EMPTY)
  const [editing, setEditing] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<Product | null>(null)
  const editor = useModal()
  const removeModal = useModal()

  const load = (f: ProductFilters = filters) => {
    setLoading(true)
    adminApi
      .inventory({ ...f, status: 'all' })
      .then(({ data }) => {
        setProducts(data.items)
        setTotalPages(data.pagination.totalPages)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [filters.page])

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.categories))
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, category: categories[0]?._id ?? '' })
    editor.open()
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      name: p.name,
      category: typeof p.category === 'string' ? p.category : p.category._id,
      brand: p.brand ?? '',
      price: p.price,
      discountPrice: p.discountPrice ?? null,
      stock: p.stock,
      minStock: p.minStock ?? 5,
      sku: p.sku ?? '',
      unit: p.unit,
      description: p.description,
      images: (p.images ?? []).join('\n'),
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
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
  category: form.category,
      brand: form.brand || undefined,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      stock: Number(form.stock),
      minStock: Number(form.minStock),
      sku: form.sku || undefined,
      unit: form.unit,
      description: form.description,
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
    }
    try {
      if (editing) {
        await adminApi.updateProduct(editing._id, payload)
        toastSuccess('Product updated')
      } else {
        await adminApi.createProduct(payload)
        toastSuccess('Product created')
      }
      editor.close()
      load()
    } catch (err) {
      toastError(err, 'Could not save product')
    } finally {
      setSaving(false)
    }
  }

  const confirmRemove = async () => {
    if (!removeTarget) return
    try {
      await adminApi.deleteProduct(removeTarget._id)
      toastSuccess('Product deleted')
      load()
    } catch (err) {
      toastError(err, 'Could not delete')
    } finally {
      removeModal.close()
    }
  }

  const toggleFeatured = async (p: Product) => {
    try {
      await adminApi.updateProduct(p._id, { isFeatured: !p.isFeatured })
      load()
    } catch (err) {
      toastError(err, 'Could not update')
    }
  }

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Products</h1>
          <p className="mt-1 text-sm text-gray-400">{products.length} products</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={filters.q ?? ''}
            onChange={(e) => {
              const q = e.target.value
              setFilters((f) => ({ ...f, q, page: 1 }))
              clearTimeout((window as any).__searchT)
              ;(window as any).__searchT = setTimeout(() => load({ ...filters, q, page: 1 }), 350)
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />)
          : products.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card overflow-hidden"
              >
                <div className="flex gap-3 p-4">
                  <img src={p.images?.[0]} alt="" className="h-20 w-20 shrink-0 rounded-xl border border-white/10 object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold text-white">{p.name}</p>
                      {p.isFeatured && <Star className="h-4 w-4 shrink-0 fill-leaf-500 text-leaf-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{typeof p.category === 'object' ? p.category.name : ''}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-base font-extrabold text-leaf-500">
                        {p.discountPrice && p.discountPrice < p.price ? formatINR(p.discountPrice) : formatINR(p.price)}
                      </span>
                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="text-xs text-gray-500 line-through">{formatINR(p.price)}</span>
                      )}
                    </div>
                    <p className={classNames('mt-1 text-xs font-semibold', p.stock === 0 ? 'text-red-400' : p.stock <= (p.minStock ?? 5) ? 'text-amber-400' : 'text-leaf-500')}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t border-white/10 p-3">
                  <Button size="sm" variant="outline" onClick={() => toggleFeatured(p)} className="flex-1">
                    <Star className={classNames('h-3.5 w-3.5', p.isFeatured ? 'fill-leaf-500 text-leaf-500' : '')} />
                    {p.isFeatured ? 'Featured' : 'Feature'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-500/10 hover:text-red-400"
                    onClick={() => {
                      setRemoveTarget(p)
                      removeModal.open()
                    }}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
      </div>

      {!loading && products.length === 0 && (
        <EmptyState icon={Package} title="No products" description="Try a different search, or add a new product." />
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
              className={classNames(
                'h-9 w-9 rounded-lg text-sm font-semibold transition-colors',
                filters.page === i + 1 ? 'bg-leaf-500 text-leaf-950' : 'bg-white/5 text-gray-400 hover:text-white',
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <Modal
        open={editor.isOpen}
        onClose={editor.close}
        title={editing ? 'Edit Product' : 'Add Product'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="ghost" onClick={editor.close}>Cancel</Button>
            <Button onClick={onSubmit} loading={saving}>{editing ? 'Save Changes' : 'Create Product'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Name" value={form.name} onChange={(e) => setField('name', e.target.value)} />
          </div>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            options={categories.map((c) => ({ value: c._id, label: c.name }))}
            placeholder="Select category"
          />
          <Input label="Brand" value={form.brand} onChange={(e) => setField('brand', e.target.value)} />
          <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setField('price', Number(e.target.value))} />
          <Input
            label="Discount Price (₹)"
            type="number"
            value={form.discountPrice ?? ''}
            placeholder="Optional"
            onChange={(e) => setField('discountPrice', e.target.value ? Number(e.target.value) : null)}
          />
          <Input label="Stock" type="number" value={form.stock} onChange={(e) => setField('stock', Number(e.target.value))} />
          <Input label="Min Stock Alert" type="number" value={form.minStock} onChange={(e) => setField('minStock', Number(e.target.value))} />
          <Input label="SKU" value={form.sku} onChange={(e) => setField('sku', e.target.value)} />
          <Input label="Unit" value={form.unit} onChange={(e) => setField('unit', e.target.value)} />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Image URLs (one per line)"
              rows={3}
              value={form.images}
              onChange={(e) => setField('images', e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setField('isFeatured', e.target.checked)} className="h-4 w-4 accent-leaf-500" />
            Featured on home page
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setField('isBestSeller', e.target.checked)} className="h-4 w-4 accent-leaf-500" />
            Best seller badge
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={removeModal.isOpen} onClose={removeModal.close}
        title="Delete this product?"
        description={`${removeTarget?.name ?? ''} will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={confirmRemove}
      />
    </div>
  )
}