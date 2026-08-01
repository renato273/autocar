import express from 'express';
import { getMenuPermissions, setMenuPermissions } from '../controllers/menuController';
import { authenticate } from '../middlewares/auth';
import { authorize } from '../middlewares/role';

export const router = express.Router();

router.use(authenticate);

// Permisos del propio usuario (lo usa el NavBar)
router.get('/me', async (req: any, res: any) => {
  req.params.userId = req.user.id;
  return getMenuPermissions(req, res);
});

// Gestión por usuario: solo ADMIN
router.get('/users/:userId', authorize(['ADMIN']), getMenuPermissions);
router.put('/users/:userId', authorize(['ADMIN']), setMenuPermissions);

export default router;
