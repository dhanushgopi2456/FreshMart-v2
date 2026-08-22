import { Product } from '../models/Product.js'
import { ApiError } from '../utils/ApiError.js'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

interface GroundedProduct {
  id: string
  name: string
  price: number
  discountPrice?: number | null
  unit: string
  rating: number
  stock: number
  category: string
  images: string[]
}

export async function fetchGroundedProducts(query: string, opts: { budget?: number; category?: string; limit?: number } = {}): Promise<GroundedProduct[]> {
  const limit = Math.min(20, opts.limit ?? 10)
  const filter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } }

  const queryTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
  const stopwords = new Set([
    'find', 'show', 'buy', 'help', 'want', 'need', 'under', 'please', 'some', 'with', 'the', 'and', 'for',
    'what', 'can', 'get', 'give', 'me', 'list', 'budget', 'total', 'good', 'best', 'fresh', 'healthy',
  ])
  const keywords = queryTokens.filter((t) => !stopwords.has(t)).slice(0, 4)

  if (keywords.length > 0) {
    filter.$or = keywords.map((k) => ({
      $or: [
        { name: { $regex: k, $options: 'i' } },
        { description: { $regex: k, $options: 'i' } },
        { brand: { $regex: k, $options: 'i' } },
      ],
    }))
  }

  if (opts.category) filter.category = opts.category
  if (opts.budget !== undefined) {
    filter.$or = [{ price: { $lte: opts.budget } }, { discountPrice: { $lte: opts.budget } }]
  }

  const products = await Product.find(filter)
    .sort({ rating: -1, reviewCount: -1 })
    .limit(limit)
    .populate('category', 'name')

  return products.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    discountPrice: p.discountPrice,
    unit: p.unit,
    rating: p.rating,
    stock: p.stock,
    category: (p.category as unknown as { name: string } | null)?.name ?? '',
    images: p.images ?? [],
  }))
}

export function buildContext(products: GroundedProduct[]): string {
  if (products.length === 0) {
    return 'The FreshMart catalog has no matching products for this request.'
  }
  const lines = products.map(
    (p) =>
      `- ${p.name} | category: ${p.category} | price: ₹${p.price}${p.discountPrice ? ` (deal: ₹${p.discountPrice})` : ''} | unit: ${p.unit} | rating: ${p.rating}/5 | in stock`,
  )
  return `Available FreshMart products matching the request:\n${lines.join('\n')}`
}

interface ChatResult {
  text: string
  products: GroundedProduct[]
  intent: string
}

export async function chatWithAI(message: string): Promise<ChatResult> {
  if (!env.openrouterApiKey) {
    const grounded = await fetchGroundedProducts(message, { limit: 6 })
    return {
      text: fallbackText(message, grounded),
      products: grounded,
      intent: 'recommendation',
    }
  }

  const grounded = await fetchGroundedProducts(message, { limit: 10 })
  const context = buildContext(grounded)

  const systemPrompt = `You are FreshMart AI, a friendly grocery shopping assistant.
You recommend products EXCLUSIVELY from the FreshMart catalog provided below.
NEVER invent products, prices, discounts, stock, or availability that are not listed.
If nothing matches, say so honestly and suggest close alternatives from the catalog.
Recommend specific products by name and give short practical reasons. Keep replies under 180 words.
Use ₹ for prices.

FreshMart catalog context:
${context}`

  let text: string
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': env.clientUrl,
      },
      body: JSON.stringify({
        model: env.openrouterModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      logger.error({ status: res.status, body: errBody }, 'OpenRouter request failed')
      throw ApiError.badRequest('AI service temporarily unavailable', 'AI_UNAVAILABLE')
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    text = data.choices?.[0]?.message?.content?.trim() || ''
  } catch (err) {
    if (err instanceof ApiError) throw err
    logger.error({ err }, 'OpenRouter error')
    text = fallbackText(message, grounded)
  }

  return { text: text || fallbackText(message, grounded), products: grounded, intent: 'chat' }
}

function fallbackText(message: string, grounded: GroundedProduct[]): string {
  if (grounded.length === 0) {
    return 'I could not find matching products in the FreshMart catalog right now. Try searching for fruits, vegetables, dairy, or snacks.'
  }
  const top = grounded.slice(0, 3).map((p) => `${p.name} (₹${p.discountPrice ?? p.price}/${p.unit})`).join(', ')
  return `Based on your request, here are some great picks from the FreshMart catalog: ${top}. All prices are live and in stock. You can add any of these straight to your cart.`
}

export async function recommendProducts(opts: { prompt?: string; budget?: number; category?: string }): Promise<{ text: string; products: GroundedProduct[] }> {
  const prompt = opts.prompt || (opts.budget ? `Recommend groceries under ₹${opts.budget}` : 'Recommend popular grocery products')
  const grounded = await fetchGroundedProducts(prompt, { budget: opts.budget, category: opts.category, limit: 8 })
  const text = grounded.length
    ? `Here are my top ${grounded.length} picks for you.`
    : 'No exact matches found — try adjusting the budget or category.'
  return { text, products: grounded }
}

export async function aiProductSearch(query: string): Promise<GroundedProduct[]> {
  return fetchGroundedProducts(query, { limit: 12 })
}