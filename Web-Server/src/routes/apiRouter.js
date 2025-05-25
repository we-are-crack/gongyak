import express from 'express';
import { search } from '../controllers/api/searchApiController.js';

const apiRouter = express.Router();

apiRouter.get('/search', search);

export default apiRouter;
