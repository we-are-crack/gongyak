import express from 'express';
import { home, pledges, share } from './homeController.js';

const rootRouter = express.Router();

rootRouter.get(['/', '/home.html'], home);
rootRouter.get('/pledges', pledges);
rootRouter.get('/share', share);

export default rootRouter;
