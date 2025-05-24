import express from 'express';
import { home, search, share } from '../controllers/homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/search', search);
rootRouter.get('/share', share);

export default rootRouter;
