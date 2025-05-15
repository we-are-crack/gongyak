import express from 'express';
import { home, fetchPledges } from './homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/pledges', fetchPledges);

export default rootRouter;
