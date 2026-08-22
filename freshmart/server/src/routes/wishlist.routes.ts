import { Router } from 'express'
import * as wishlistCtrl from '../controllers/wishlist.controller.js'
import { safeId } from '../middleware/validation.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.get('/', wishlistCtrl.getWishlist)
router.post('/:productId', safeId, wishlistCtrl.addToWishlist)
router.delete('/:productId', safeId, wishlistCtrl.removeFromWishlist)

export default router