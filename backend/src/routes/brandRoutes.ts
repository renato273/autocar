import { Router } from 'express';
import { getBrands, createBrand, deleteBrand } from '../controllers/brandController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';

const router = Router();

router.use(authenticate);

router.get('/', getBrands);
router.post('/', authorize(['ADMIN']), createBrand);
router.delete('/:id', authorize(['ADMIN']), deleteBrand);

export default router;
