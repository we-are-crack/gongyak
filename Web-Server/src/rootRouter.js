import express from 'express';
import { home } from './homeController.js';

const rootRouter = express.Router();

rootRouter.get('/', home);

export default rootRouter;
