import { Router } from 'express'
import * as accountCtrl from '../controllers/account.controller.js'
import { validate, safeId } from '../middleware/validation.js'
import { updateProfileSchema, changePasswordSchema, addressSchema } from '../validators/auth.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()
router.use(authenticate)

router.put('/profile', validate(updateProfileSchema), accountCtrl.updateProfile)
router.put('/change-password', validate(changePasswordSchema), accountCtrl.changePassword)

router.get('/addresses', accountCtrl.getAddresses)
router.post('/addresses', validate(addressSchema), accountCtrl.addAddress)
router.put('/addresses/:id', safeId, validate(addressSchema), accountCtrl.updateAddress)
router.delete('/addresses/:id', safeId, accountCtrl.deleteAddress)

router.get('/notifications', accountCtrl.getNotifications)
router.put('/notifications/read', accountCtrl.markNotificationsRead)

export default router