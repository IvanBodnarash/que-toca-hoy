import { Router } from 'express';
import { register, login, profile, refresh, logout, updateProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const authRouter = Router();

// Register route
authRouter.post('/register', register);

// Login route
authRouter.post('/login', login);

// Refresh route
authRouter.post('/refresh', refresh);

// Logout route
authRouter.post('/logout', logout);

// Profile routes

// Profile (get)
authRouter.get('/profile', verifyToken, profile);

// Profile (put)
authRouter.put('/profile', verifyToken, updateProfile);

export default authRouter;