import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rootRouter from './routes/homeRouter.js';
import apiRouter from './routes/apiRouter.js';

import {
  staticMiddleware,
  helmetMiddleware,
  loggerMiddleware,
  jsonMiddleware,
  urlencodedMiddleware,
  rateLimitMiddleware,
  corsMiddleware,
  requestLoggerMiddleware,
} from './middlewares/index.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pug 템플릿 엔진 설정
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'pug');

// 정적 파일 라우트
staticMiddleware(__dirname).forEach(mw => app.use(mw));

// 기타 미들웨어
app.use(helmetMiddleware);
app.use(loggerMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);
app.use(rateLimitMiddleware);
app.use(corsMiddleware);
app.use(requestLoggerMiddleware);

app.use('/', rootRouter);
app.use('/api', apiRouter);

export default app;
