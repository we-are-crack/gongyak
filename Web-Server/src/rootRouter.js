import express from 'express';
import { home, fetchPledges } from './homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/test', fetchPledges);

export default rootRouter;
