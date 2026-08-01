import express from 'express';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, addVehicleImages, deleteVehicleImage } from '../controllers/vehicleController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';
import { upload } from '../middlewares/upload';

export const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize(['ADMIN', 'USER']), getVehicles);
router.post('/', authorize(['ADMIN', 'USER']), createVehicle);
router.put('/:id', authorize(['ADMIN', 'USER']), updateVehicle);
router.delete('/:id', authorize(['ADMIN', 'USER']), deleteVehicle);
router.post('/:id/images', authorize(['ADMIN', 'USER']), upload.array('images', 3), addVehicleImages);
router.delete('/:id/images/:index', authorize(['ADMIN', 'USER']), deleteVehicleImage);
export default router;
