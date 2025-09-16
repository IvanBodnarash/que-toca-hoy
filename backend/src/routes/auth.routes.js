import { Router } from 'express';
import { register, login, profile, refresh, logout, updateProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// Ruta para registrar un nuevo usuario
authRouter.post('/register', register);

// Ruta para login
authRouter.post('/login', login);

authRouter.post('/refresh', refresh);
authRouter.post('/logout', logout);

// Ruta para profile
// Profile (get)
authRouter.get('/profile', verifyToken, profile);

// Profile (put)
authRouter.put('/profile', verifyToken, updateProfile);

export default authRouter;