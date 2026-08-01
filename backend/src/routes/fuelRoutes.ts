import express from 'express';
import { getFuelLoads, createFuelLoad, updateFuelLoad, deleteFuelLoad, getFuelStats, getFuelYearly, getFuelPriceHistory } from '../controllers/fuelController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { upload } from '../middlewares/upload';

export const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN', 'USER']), getFuelLoads);
router.get('/stats', authorize(['ADMIN', 'USER']), getFuelStats);
router.get('/yearly', authorize(['ADMIN', 'USER']), getFuelYearly);
router.get('/prices', authorize(['ADMIN', 'USER']), getFuelPriceHistory);
router.post('/', authorize(['ADMIN', 'USER']), upload.single('image'), createFuelLoad);
router.put('/:id', authorize(['ADMIN', 'USER']), upload.single('image'), updateFuelLoad);
router.delete('/:id', authorize(['ADMIN', 'USER']), deleteFuelLoad);
export default router;
