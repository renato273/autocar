import { Router } from 'express';
import authRoutes from './authRoutes';
import fuelRoutes from './fuelRoutes';
import vehicleRoutes from './vehicleRoutes';
import brandRoutes from './brandRoutes';
import userRoutes from './userRoutes';
import menuRoutes from './menuRoutes';
import { swaggerRouter } from '../swagger';

const router = Router();
router.use('/auth', authRoutes);
router.use('/fuel', fuelRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/brands', brandRoutes);
router.use('/users', userRoutes);
router.use('/permissions', menuRoutes);
router.use('/docs', swaggerRouter);

export default router;
