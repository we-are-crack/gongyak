import express from 'express';
import { home, share } from '../controllers/homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/share', share);

export default rootRouter;
