import { Router } from 'express'
import * as admin from '../controllers/admin.controller.js'
import * as productCtrl from '../controllers/product.controller.js'
import * as categoryCtrl from '../controllers/category.controller.js'
import * as reviewCtrl from '../controllers/review.controller.js'
import { requireAdmin, authenticate } from '../middleware/auth.js'
import { validate, safeId } from '../middleware/validation.js'
import { productSchema, categorySchema } from '../validators/product.js'
import {
  couponSchema,
  orderStatusSchema,
  userStatusSchema,
  userRoleSchema,
  inventoryUpdateSchema,
} from '../validators/admin.js'

const router = Router()
router.use(authenticate, requireAdmin)

router.get('/dashboard', admin.dashboard)
router.get('/analytics', admin.analytics)

router.get('/orders', admin.allOrders)
router.put('/orders/:id/status', safeId, validate(orderStatusSchema), admin.updateOrderStatus)

router.get('/users', admin.users)
router.get('/users/:id', safeId, admin.userDetail)
router.put('/users/:id/status', safeId, validate(userStatusSchema), admin.updateUserStatus)
router.put('/users/:id/role', safeId, validate(userRoleSchema), admin.updateUserRole)

router.get('/inventory', admin.inventory)
router.put('/inventory/:id', safeId, validate(inventoryUpdateSchema), admin.updateInventory)

router.get('/coupons', admin.coupons)
router.post('/coupons', validate(couponSchema), admin.createCoupon)
router.put('/coupons/:id', safeId, validate(couponSchema), admin.updateCoupon)
router.delete('/coupons/:id', safeId, admin.deleteCoupon)

router.get('/reviews', admin.allReviews)
router.put('/reviews/:id/moderate', safeId, reviewCtrl.moderateReview)
router.delete('/reviews/:id', safeId, reviewCtrl.deleteReview)

router.get('/products', productCtrl.listProducts)
router.get('/products/all', productCtrl.listProducts)
router.post('/products', validate(productSchema), productCtrl.createProduct)
router.put('/products/:id', safeId, validate(productSchema), productCtrl.updateProduct)
router.delete('/products/:id', safeId, productCtrl.deleteProduct)

router.get('/categories', admin.categories)
router.post('/categories', validate(categorySchema), categoryCtrl.createCategory)
router.put('/categories/:id', safeId, validate(categorySchema), categoryCtrl.updateCategory)
router.delete('/categories/:id', safeId, categoryCtrl.deleteCategory)

export default router