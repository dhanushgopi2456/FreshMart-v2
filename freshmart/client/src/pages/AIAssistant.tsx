import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Bot, User, RefreshCw, Lightbulb, ShoppingBag } from 'lucide-react'
import { aiApi } from '@/services'
import type { Product } from '@/types'
import { getErrorMessage } from '@/services/api'
import { formatINR } from '@/utils/format'
import { useCartStore } from '@/store/cartStore'
import { flyToCart } from '@/utils/cartFx'
import { toastError } from '@/services/api'

interface Message {
  role: 'user' | 'assistant'
  text: string
  products?: Product[]
}

const SUGGESTIONS = [
  'Plan a healthy week of meals under ₹1500',
  'What snacks are good for a kids birthday party?',
  'I need ingredients for an Indian dinner tonight',
  'Show me the best deals right now',
  'What should I stock for a monsoon movie night?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hey! I'm FreshAI, your personal grocery assistant. Ask me to plan meals, find ingredients, or build a shopping list for you.",
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const { addItem } = useCartStore()
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || typing) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', text: content }])
    setTyping(true)
    try {
      const { data } = await aiApi.chat(content)
      setMessages((m) => [...m, { role: 'assistant', text: data.text, products: data.products }])
    } catch (err) {
      const msg = getErrorMessage(err)
      setMessages((m) => [...m, { role: 'assistant', text: `I hit a snag: ${msg}. Try again in a moment!` }])
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  const handleAdd = async (p: Product) => {
    try {
      await addItem(p._id, 1)
      flyToCart(p)
    } catch (err) {
      toastError(err, 'Could not add to cart')
    }
  }

  return (
    <div className="container-fm pt-24 pb-16">
      <div className="mx-auto flex max-w-3xl flex-col">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-leaf-500 to-mint">
            <Sparkles className="h-7 w-7 text-leaf-950" />
            <span className="absolute -right-1 -top-1 h-3.5 w-3.5 animate-pulse rounded-full bg-leaf-500" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">FreshAI Assistant</h1>
            <p className="text-sm text-gray-400">Powered by live product data — try it with real questions.</p>
          </div>
        </div>

        <div className="card flex min-h-[60vh] flex-col p-0">
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf-500/15">
                      <Bot className="h-4 w-4 text-leaf-500" />
                    </div>
                  )}
                  <div className={`max-w-[82%] ${m.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={
                        m.role === 'user'
                          ? 'rounded-2xl rounded-br-md bg-leaf-500 px-4 py-3 text-sm font-medium text-leaf-950'
                          : 'rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100'
                      }
                    >
                      {m.text}
                    </div>

                    {m.products && m.products.length > 0 && (
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {m.products.slice(0, 4).map((p) => (
                          <div
                            key={p._id}
                            className={`overflow-hidden rounded-xl border transition-colors ${
                              expandedProduct === p._id ? 'border-leaf-500/40' : 'border-white/10'
                            }`}
                          >
                            <button
                              onClick={() => setExpandedProduct(expandedProduct === p._id ? null : p._id)}
                              className="flex w-full items-center gap-3 p-3 text-left"
                            >
                              <img src={p.images?.[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-white">{p.name}</p>
                                <p className="text-xs font-semibold text-leaf-500">
                                  {p.discountPrice && p.discountPrice < p.price ? formatINR(p.discountPrice) : formatINR(p.price)}
                                  {p.discountPrice && p.discountPrice < p.price && (
                                    <span className="ml-1 text-[10px] font-normal text-gray-500 line-through">{formatINR(p.price)}</span>
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {p.unit} · {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                </p>
                              </div>
                            </button>
                            {expandedProduct === p._id && (
                              <div className="border-t border-white/10 p-3">
                                <p className="line-clamp-2 text-xs text-gray-400">{p.description}</p>
                                <button
                                  onClick={() => handleAdd(p)}
                                  disabled={p.stock <= 0}
                                  className="btn-primary mt-3 w-full justify-center py-2 text-xs"
                                >
                                  <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.role === 'user' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint/15">
                      <User className="h-4 w-4 text-mint" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {typing && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf-500/15">
                  <Bot className="h-4 w-4 text-leaf-500" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-leaf-500"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length === 1 && (
            <div className="px-5 pb-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Lightbulb className="h-3.5 w-3.5 text-leaf-500" /> Try asking:
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition-colors hover:border-leaf-500/40 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex items-end gap-3"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                rows={1}
                placeholder="Ask FreshAI anything... (Shift+Enter for new line)"
                className="flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-leaf-500/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="btn-primary aspect-square shrink-0 justify-center p-3 disabled:opacity-40"
                aria-label="Send"
              >
                {typing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}