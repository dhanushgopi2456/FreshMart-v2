import { z } from 'zod'

export const aiChatSchema = z.object({
  message: z.string().trim().min(2, 'Message too short').max(600, 'Message too long'),
})

export const aiRecommendationsSchema = z.object({
  prompt: z.string().trim().min(2).max(600).optional(),
  budget: z.number().min(0).max(1_000_000).optional(),
  category: z.string().trim().max(120).optional(),
})

export const aiProductSearchSchema = z.object({
  query: z.string().trim().min(2).max(600),
})