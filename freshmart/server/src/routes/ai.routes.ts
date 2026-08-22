import { Router } from 'express'
import * as aiCtrl from '../controllers/ai.controller.js'
import { validate } from '../middleware/validation.js'
import { aiChatSchema, aiRecommendationsSchema, aiProductSearchSchema } from '../validators/ai.js'
import { aiLimiter } from '../middleware/rateLimiter.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(aiLimiter)
router.use(authenticate)

router.post('/chat', validate(aiChatSchema), aiCtrl.chat)
router.post('/recommendations', validate(aiRecommendationsSchema), aiCtrl.recommendations)
router.post('/product-search', validate(aiProductSearchSchema), aiCtrl.productSearch)

export default router