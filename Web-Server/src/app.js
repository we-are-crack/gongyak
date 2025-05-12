import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import rootRouter from './rootRouter.js';

const app = express();
const logger = morgan('dev');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'client'))); // 정적 파일 제공

app.use(helmet()); // 보안 모듈
app.use(logger); // 로그 관리 모듈
app.use(express.json()); // request body parsing
app.use(express.urlencoded({ extended: true })); // url query prameter parsing
app.use(cors()); // cors 모듈

// 요청 디버깅용 미들웨어
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/', rootRouter);

export default app;
