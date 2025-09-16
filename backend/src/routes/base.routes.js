import { verifyToken } from '../middlewares/auth.middleware.js';
import express from 'express';

export const createBaseRouter = (controller, protectedRoutes = true) => { // protectedRoutes=true para forzar la verificación del token
    const router = express.Router();

    if (protectedRoutes) {
        // Apply authentication middleware for all routes
        router.use(verifyToken);
    }

    router.get('/', controller.getAll);
    router.post('/', controller.create);
    router.get('/:id', controller.getByID);
    router.put('/:id', controller.update);
    router.delete('/:id', controller.delete);

    return router;
};