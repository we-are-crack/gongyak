import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import rootRouter from './rootRouter.js';

const app = express();
const logger = morgan('dev');

app.set('views', process.cwd() + '/src/views');
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
