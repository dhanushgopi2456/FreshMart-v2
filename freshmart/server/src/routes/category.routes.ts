import { Router } from 'express'
import * as categoryCtrl from '../controllers/category.controller.js'
import { validate, safeId } from '../middleware/validation.js'
import { categorySchema } from '../validators/product.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', categoryCtrl.listCategories)
router.get('/slug/:slug', categoryCtrl.getCategoryBySlug)
router.get('/:id', safeId, categoryCtrl.getCategory)

router.post('/', requireAdmin, validate(categorySchema), categoryCtrl.createCategory)
router.put('/:id', requireAdmin, safeId, validate(categorySchema), categoryCtrl.updateCategory)
router.delete('/:id', requireAdmin, safeId, categoryCtrl.deleteCategory)

export default router