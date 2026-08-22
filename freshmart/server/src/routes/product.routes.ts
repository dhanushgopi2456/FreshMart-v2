import { Router } from 'express'
import * as productCtrl from '../controllers/product.controller.js'
import * as reviewCtrl from '../controllers/review.controller.js'
import { validate, safeId } from '../middleware/validation.js'
import { productSchema, productQuerySchema } from '../validators/product.js'
import { reviewSchema } from '../validators/shop.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', validate(productQuerySchema, 'query'), productCtrl.listProducts)
router.get('/featured', productCtrl.getFeatured)
router.get('/bestsellers', productCtrl.getBestSellers)
router.get('/deals', productCtrl.getDeals)
router.get('/slug/:slug', productCtrl.getProductBySlug)

router.get('/:id/reviews', safeId, reviewCtrl.getProductReviews)
router.post('/:id/reviews', authenticate, safeId, validate(reviewSchema), reviewCtrl.addReview)

router.get('/:id', safeId, productCtrl.getProduct)

router.post('/', requireAdmin, validate(productSchema), productCtrl.createProduct)
router.put('/:id', requireAdmin, safeId, validate(productSchema), productCtrl.updateProduct)
router.delete('/:id', requireAdmin, safeId, productCtrl.deleteProduct)

export default router