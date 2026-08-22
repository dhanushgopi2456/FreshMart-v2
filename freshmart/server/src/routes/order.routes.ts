import { Router } from 'express'
import * as orderCtrl from '../controllers/order.controller.js'
import { validate, safeId } from '../middleware/validation.js'
import { orderCreateSchema, paymentVerifySchema, cancelOrderSchema } from '../validators/shop.js'
import { authenticate } from '../middleware/auth.js'
import { paymentLimiter } from '../middleware/rateLimiter.js'

const router = Router()

router.get('/statuses', orderCtrl.orderStatuses)

router.use(authenticate)

router.post('/', validate(orderCreateSchema), orderCtrl.createOrder)
router.get('/', orderCtrl.getMyOrders)
router.get('/:id', safeId, orderCtrl.getMyOrder)
router.put('/:id/cancel', safeId, validate(cancelOrderSchema), orderCtrl.cancelOrder)
router.put('/:id/confirm-cod', safeId, orderCtrl.confirmCodOrder)
router.post('/verify-payment', paymentLimiter, validate(paymentVerifySchema), orderCtrl.verifyPayment)

export default router