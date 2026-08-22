import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ShoppingBasket, Sparkles, Bot, Truck, ShieldCheck, Clock, Star, Heart, Package, ChevronRight } from 'lucide-react'
import { homeApi } from '@/services'
import type { Category, Product } from '@/types'
import { HeroScene } from '@/three/HeroScene'
import { CategoryCard } from '@/components/CategoryCard'
import { ProductCard } from '@/components/ProductCard'
import { ProductGridSkeleton } from '@/components/ui/Feedback'
import { Reveal, RevealGroup, RevealItem } from '@/animations/Reveal'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'

interface HomeData {
  categories: Category[]
  featured: Product[]
  bestSellers: Product[]
  deals: Product[]
}

export default function Home() {
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    homeApi
      .get()
      .then(({ data }) => setData(data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  const heroProducts = (data?.featured ?? []).slice(0, 4).map((p) => ({
    id: p._id,
    name: p.name,
    price: p.discountPrice ?? p.price,
    image: p.images?.[0] ?? '',
  }))

  return (
    <div className="relative">
      {/* HERO */}
      <section className="relative overflow-hidden pt-24 pb-10 sm:pt-32">
        <div className="container-fm grid items-center gap-8 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-leaf-500/30 bg-leaf-500/10 px-4 py-1.5 text-xs font-semibold text-leaf-100"
            >
              <Sparkles className="h-3.5 w-3.5" />
              FreshMart 2026 · 3D Organic Marketplace
            </motion.div>

            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="block text-white"
              >
                Freshness
                <span className="text-gradient"> Delivered.</span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="block text-white"
              >
                Happiness
                <span className="text-gradient"> Included.</span>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 max-w-lg text-base text-gray-400 sm:text-lg"
            >
              Shop fresh groceries, handpicked fruits, farm vegetables and everyday essentials with a
              modern, fast and intelligent shopping experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to="/shop" className="btn-primary group px-7 py-4 text-base">
                <ShoppingBasket className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Shop Catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/categories" className="btn-outline px-7 py-4 text-base">
                Explore Categories
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6"
            >
              {[
                { icon: Clock, value: '30 Min', label: 'Cold-Chain Delivery' },
                { icon: ShieldCheck, value: '100%', label: 'Quality Checked' },
                { icon: Star, value: '50K+', label: 'Happy Customers' },
              ].map((s) => (
                <div key={s.label}>
                  <s.icon className="mb-2 h-5 w-5 text-leaf-500" />
                  <p className="font-display text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            className="order-1 lg:order-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <HeroScene products={heroProducts} />
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Shop by category</p>
                <h2 className="section-title">Popular Categories</h2>
              </div>
              <Link to="/categories" className="hidden items-center gap-1 text-sm font-semibold text-leaf-100 hover:text-leaf-500 sm:flex">
                All categories <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="card h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <RevealGroup stagger={0.05}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {data?.categories.map((c, i) => (
                  <RevealItem key={c._id}>
                    <CategoryCard category={c} index={i} />
                  </RevealItem>
                ))}
              </div>
            </RevealGroup>
          )}
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Handpicked for you</p>
                <h2 className="section-title">Featured Products</h2>
              </div>
              <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-leaf-100 hover:text-leaf-500 sm:flex">
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data?.featured.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DEALS */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Limited time</p>
              <h2 className="section-title">Today's Deals</h2>
            </div>
          </Reveal>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data?.deals.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="mb-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Loved by thousands</p>
              <h2 className="section-title">Best Sellers</h2>
            </div>
          </Reveal>
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data?.bestSellers.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WHY FRESHMART */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="mb-10 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-leaf-500">Why FreshMart</p>
              <h2 className="section-title">Fresh, Fast & Intelligent</h2>
            </div>
          </Reveal>
          <RevealGroup stagger={0.1}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Truck, title: '30-Minute Delivery', desc: 'Cold-chain delivery keeps every item farm-fresh at your door.' },
                { icon: ShieldCheck, title: '100% Quality Checked', desc: 'Every product passes rigorous freshness and quality checks.' },
                { icon: Bot, title: 'AI Shopping Assistant', desc: 'Get smart, budget-aware recommendations grounded in real catalog data.' },
                { icon: Package, title: 'Effortless Returns', desc: 'Hassle-free replacements and refunds if anything disappoints.' },
              ].map((f) => (
                <RevealItem key={f.title}>
                  <div className="card group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-leaf-500/30 hover:shadow-glow">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf-500/10 text-leaf-500 transition-colors group-hover:bg-leaf-500/20">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-base font-bold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm text-gray-400">{f.desc}</p>
                  </div>
                </RevealItem>
              ))}
            </div>
          </RevealGroup>
        </div>
      </section>

      {/* AI CTA */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="relative overflow-hidden rounded-4xl border border-leaf-500/20 bg-gradient-to-br from-leaf-500/10 via-midnight-100 to-midnight-200 p-8 sm:p-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf-500/10 blur-3xl" />
              <div className="relative grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-leaf-500/15 px-3 py-1 text-xs font-semibold text-leaf-100">
                    <Bot className="h-4 w-4" /> Ask FreshMart AI
                  </div>
                  <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                    Your personal grocery
                    <span className="text-gradient"> assistant</span>
                  </h2>
                  <p className="mt-3 max-w-md text-gray-400">
                    "Find healthy breakfast under ₹500." "Suggest groceries for pasta." Ask anything —
                    FreshMart AI recommends real products with real prices from our catalog.
                  </p>
                  <button
                    onClick={() => navigate(user ? '/ai' : '/login?redirect=/ai')}
                    className="btn-primary mt-6 px-7 py-4"
                  >
                    <Bot className="h-5 w-5" /> Ask FreshMart AI
                  </button>
                </div>
                <div className="hidden lg:block">
                  <div className="card mx-auto max-w-sm space-y-3 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-500 text-leaf-950">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-sm text-gray-300">
                        Suggest groceries for a week of healthy breakfasts under ₹500.
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-leaf-500 text-leaf-950">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="space-y-2 rounded-2xl rounded-tl-sm bg-leaf-500/10 px-4 py-3 text-sm text-leaf-100">
                        <p>Here's a plan: Organic Muesli (₹235), Greek Yogurt (₹120), Bananas (₹45) & Farm Eggs (₹96).</p>
                        <p className="flex items-center gap-2 text-xs text-leaf-500">
                          <Heart className="h-3.5 w-3.5" /> All in stock · ₹496 total
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="py-16">
        <div className="container-fm">
          <Reveal>
            <div className="card mx-auto max-w-2xl p-8 text-center sm:p-10">
              <h2 className="section-title">Get fresh deals, delivered.</h2>
              <p className="mt-3 text-gray-400">
                Join 50,000+ customers getting weekly offers and new arrivals.
              </p>
              <NewsletterForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <form
      className="mx-auto mt-6 flex max-w-md gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!email.includes('@')) return
        setDone(true)
      }}
    >
      <AnimatePresence mode="wait">
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-leaf-500/40 bg-leaf-500/10 py-3 text-sm font-semibold text-leaf-100"
          >
            <Heart className="h-4 w-4 text-leaf-500" /> You're on the list!
          </motion.p>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="input"
            />
            <button className="btn-primary shrink-0" type="submit">
              Subscribe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}