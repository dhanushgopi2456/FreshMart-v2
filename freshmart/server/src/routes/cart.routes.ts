import { Router } from 'express'
import * as cartCtrl from '../controllers/cart.controller.js'
import { validate, safeId } from '../middleware/validation.js'
import { cartItemSchema, cartItemUpdateSchema, applyCouponSchema } from '../validators/shop.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', cartCtrl.getCart)
router.post('/items', validate(cartItemSchema), cartCtrl.addItem)
router.put('/items/:id', safeId, validate(cartItemUpdateSchema), cartCtrl.updateItem)
router.delete('/items/:id', safeId, cartCtrl.removeItem)
router.post('/coupon', validate(applyCouponSchema), cartCtrl.applyCoupon)
router.delete('/coupon', cartCtrl.removeCoupon)
router.delete('/', cartCtrl.clearCart)

export default router