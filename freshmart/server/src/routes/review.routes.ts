import { Router } from 'express'
import * as reviewCtrl from '../controllers/review.controller.js'
import { safeId } from '../middleware/validation.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/product/:productId/reviewable', authenticate, safeId, reviewCtrl.isReviewable)
router.delete('/:id', authenticate, safeId, reviewCtrl.deleteReview)
router.put('/:id/moderate', authenticate, requireAdmin, safeId, reviewCtrl.moderateReview)

export default router