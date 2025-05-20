import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import rootRouter from './rootRouter.js';
import dotenv from 'dotenv';
import {
  staticMiddleware,
  helmetMiddleware,
  loggerMiddleware,
  jsonMiddleware,
  urlencodedMiddleware,
  rateLimitMiddleware,
  corsMiddleware,
  requestLoggerMiddleware,
} from './middlewares.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pug 템플릿 엔진 설정
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'pug');

// 정적 파일 라우트
app.use(staticMiddleware(__dirname));

// 기타 미들웨어
app.use(helmetMiddleware);
app.use(loggerMiddleware);
app.use(jsonMiddleware);
app.use(urlencodedMiddleware);
app.use(rateLimitMiddleware);
app.use(corsMiddleware);
app.use(requestLoggerMiddleware);

app.use('/', rootRouter);

export default app;
