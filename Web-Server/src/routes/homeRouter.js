import express from 'express';
import { home, share } from '../controllers/homeController.js';
import { search } from '../controllers/searchController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/search', search);
rootRouter.get('/share', share);

export default rootRouter;
