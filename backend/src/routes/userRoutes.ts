import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';

export const router = express.Router();

router.use(authenticate, authorize(['ADMIN']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
