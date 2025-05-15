import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import rootRouter from './rootRouter.js';

const app = express();
const logger = morgan('dev');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  },
});

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdn.jsdelivr.net',
        'https://fonts.googleapis.com',
        'https://cdn.rawgit.com',
      ],
      fontSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com', 'https://cdn.rawgit.com'],
      imgSrc: ["'self'", 'data:', 'https://storage.googleapis.com', 'https://i.namu.wiki'],
      connectSrc: ["'self'"],
    },
  },
};

app.use((req, res, next) => {
  if (
    req.method === 'GET' &&
    (req.url === '/' ||
      req.url.startsWith('/home.html') ||
      req.url.startsWith('/favicon.ico') ||
      req.url.startsWith('/script.js') ||
      req.url.startsWith('/style.css') ||
      req.url.startsWith('/assets') ||
      req.url.startsWith('/images'))
  ) {
    return next();
  }
  limiter(req, res, next);
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));
app.use(helmet(helmetOptions));
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/', rootRouter);

export default app;
