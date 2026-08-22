import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { categoryApi, productApi } from '@/services'
import type { Category, Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/animations/Reveal'

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [productsByCat, setProductsByCat] = useState<Record<string, Product[]>>({})

  useEffect(() => {
    categoryApi
      .list()
      .then(async ({ data }) => {
        setCategories(data.categories)
        const results: Record<string, Product[]> = {}
        await Promise.all(
          data.categories.slice(0, 9).map(async (c) => {
            try {
              const res = await productApi.list({ category: c.slug, limit: 4 })
              results[c._id] = res.data.products
            } catch {
              results[c._id] = []
            }
          }),
        )
        setProductsByCat(results)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="pt-24 pb-16">
      <div className="container-fm">
        <Reveal>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Browse the market</p>
          <h1 className="section-title">All Categories</h1>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {categories.map((c, i) => {
            const items = productsByCat[c._id] ?? []
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.5) }}
                className="card overflow-hidden transition-all duration-300 hover:border-leaf-500/30 hover:shadow-glow"
              >
                <Link to={`/shop?category=${c.slug}`} className="block p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-white">{c.name}</h2>
                    <ArrowRight className="h-4 w-4 text-leaf-500 transition-transform group-hover:translate-x-1" />
                  </div>
                  {c.description && <p className="mt-1 text-xs text-gray-500">{c.description}</p>}
                </Link>
                {items.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 px-3 pb-4">
                    {items.map((p) => (
                      <ProductCard key={p._id} product={p} />
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}