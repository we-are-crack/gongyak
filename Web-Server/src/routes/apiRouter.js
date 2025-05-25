import express from 'express';
import { search } from '../controllers/api/searchApiController.js';
import { searchQueryList } from '../controllers/api/searchListApiController.js';

const apiRouter = express.Router();

apiRouter.get('/search', search);
apiRouter.get('/searchList', searchQueryList);

export default apiRouter;
