import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X, Check, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react'
import { productApi, categoryApi } from '@/services'
import type { Category, Product, ProductFilters } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton, EmptyState } from '@/components/ui/Feedback'
import { Button } from '@/components/ui/Button'
import { debounce, classNames } from '@/utils/format'

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Highest Rated' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(params.get('q') ?? '')
  const [showFilters, setShowFilters] = useState(false)

  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'popular'
  const minPrice = params.get('minPrice') ?? ''
  const maxPrice = params.get('maxPrice') ?? ''
  const minRating = params.get('minRating') ?? ''
  const inStock = params.get('inStock') ?? ''
  const page = Number(params.get('page')) || 1

  useEffect(() => {
    categoryApi.list().then(({ data }) => setCategories(data.categories)).catch(() => {})
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const filters: ProductFilters = {
      q: q || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStock: inStock ? inStock === 'true' : undefined,
      sort: sort as ProductFilters['sort'],
      page,
      limit: 12,
    }
    try {
      const { data } = await productApi.list(filters)
      setProducts(data.products)
      setTotal(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch {
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [q, category, sort, minPrice, maxPrice, minRating, inStock, page])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next, { replace: true })
  }

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setParam('q', term)
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params],
  )

  const onSearchChange = (value: string) => {
    setSearchTerm(value)
    debouncedSearch(value)
  }

  const activeFilters: Array<{ label: string; clear: () => void }> = []
  if (q) activeFilters.push({ label: `"${q}"`, clear: () => setParam('q', '') })
  if (category) activeFilters.push({ label: categories.find((c) => c.slug === category)?.name ?? category, clear: () => setParam('category', '') })
  if (minPrice || maxPrice) activeFilters.push({ label: `₹${minPrice || 0}–₹${maxPrice || '∞'}`, clear: () => { setParam('minPrice', ''); setParam('maxPrice', '') } })
  if (minRating) activeFilters.push({ label: `${minRating}★+`, clear: () => setParam('minRating', '') })
  if (inStock === 'true') activeFilters.push({ label: 'In stock', clear: () => setParam('inStock', '') })

  const clearAll = () => setParams(new URLSearchParams(), { replace: true })

  return (
    <div className="pt-24 pb-16">
      <div className="container-fm">
        <div className="mb-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">
            Catalog
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title"
          >
            Shop Fresh
          </motion.h1>
        </div>

        {/* Search + sort + filter toggle */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search fruits, vegetables, brands..."
              aria-label="Search products"
              className="input pl-11"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={sort}
              onChange={(e) => setParam('sort', e.target.value)}
              aria-label="Sort products"
              className="input w-auto min-w-[160px] py-2.5"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-midnight-200">
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className={classNames(
                'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                showFilters
                  ? 'border-leaf-500/60 bg-leaf-500/10 text-leaf-100'
                  : 'border-white/10 text-gray-300 hover:border-white/25',
              )}
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilters.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf-500 text-[10px] font-bold text-leaf-950">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 flex flex-wrap items-center gap-2 overflow-hidden"
            >
              {activeFilters.map((f) => (
                <motion.button
                  key={f.label}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={f.clear}
                  className="chip"
                >
                  <Check className="h-3 w-3" /> {f.label}
                  <X className="h-3 w-3 opacity-60 hover:opacity-100" />
                </motion.button>
              ))}
              <button onClick={clearAll} className="text-xs font-semibold text-gray-400 underline-offset-2 hover:text-leaf-100 hover:underline">
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
  className={classNames(
    'grid gap-6',
    showFilters ? 'lg:grid-cols-[240px_1fr]' : 'grid-cols-1'
  )}
>
          {/* Sidebar filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="card h-fit space-y-6 p-5 lg:sticky lg:top-24"
              >
                <FilterSection title="Category">
                  <div className="space-y-1">
                    <button onClick={() => setParam('category', '')} className={classNames('filter-link', !category && 'filter-link-active')}>
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => setParam('category', c.slug)}
                        className={classNames('filter-link', category === c.slug && 'filter-link-active')}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Price Range (₹)">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setParam('minPrice', e.target.value)}
                      placeholder="Min"
                      min={0}
                      className="input py-2 text-xs"
                      aria-label="Minimum price"
                    />
                    <span className="text-gray-500">–</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setParam('maxPrice', e.target.value)}
                      placeholder="Max"
                      min={0}
                      className="input py-2 text-xs"
                      aria-label="Maximum price"
                    />
                  </div>
                </FilterSection>

                <FilterSection title="Rating">
                  <div className="space-y-1">
                    {['4', '3'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setParam('minRating', minRating === r ? '' : r)}
                        className={classNames('filter-link', minRating === r && 'filter-link-active')}
                      >
                        {r}★ & above
                      </button>
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Availability">
                  <button
                    onClick={() => setParam('inStock', inStock === 'true' ? '' : 'true')}
                    className={classNames('filter-link', inStock === 'true' && 'filter-link-active')}
                  >
                    In stock only
                  </button>
                </FilterSection>

                <Button variant="outline" fullWidth onClick={clearAll}>
                  Clear All
                </Button>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Results */}
          <div>
            <motion.p key={`count-${total}`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-4 text-sm text-gray-400">
              <motion.span key={total} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="inline-block font-bold text-leaf-100">
                {total}
              </motion.span>{' '}
              products found
            </motion.p>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProductGridSkeleton />
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="card">
                  <EmptyState
                    icon={PackageSearch}
                    title="We couldn't find matching groceries"
                    description="Try adjusting your search or filters."
                    action={
                      <Button onClick={clearAll}>Clear Filters</Button>
                    }
                  />
                </motion.div>
              ) : (
                <motion.div key={`${q}-${category}-${page}`} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
                  <motion.div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                    variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
                  >
                    {products.map((p, i) => (
                      <motion.div
                        key={p._id}
                        variants={{
                          hidden: { opacity: 0, y: 16, scale: 0.97 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35 } },
                        }}
                      >
                        <ProductCard product={p} index={i} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  onClick={() => setParam('page', String(page - 1))}
                  disabled={page <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition-colors hover:border-leaf-500/40 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }).slice(0, 6).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setParam('page', String(i + 1))}
                    className={classNames(
                      'h-10 w-10 rounded-xl text-sm font-semibold transition-all',
                      page === i + 1 ? 'bg-leaf-500 text-leaf-950' : 'border border-white/10 text-gray-300 hover:border-leaf-500/40',
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setParam('page', String(page + 1))}
                  disabled={page >= totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-gray-300 transition-colors hover:border-leaf-500/40 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  )
}