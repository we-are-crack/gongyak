import express from 'express';
import { home, pledges } from './homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.get('/pledges', pledges);

export default rootRouter;
