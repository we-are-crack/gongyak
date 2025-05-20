import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import rootRouter from './rootRouter.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const logger = morgan('dev');
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pug 템플릿 엔진 설정
app.set('views', path.join(__dirname, 'client'));
app.set('view engine', 'pug');

// 환경변수에서 값 읽기
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 10;

// CSP directive 파싱 함수
function parseCspDirective(envKey) {
  const reserved = ['self', 'none', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic', 'report-sample'];
  const value = process.env[envKey];

  if (!value) return undefined;

  return value.split(',').map(s => {
    const trimmed = s.trim();
    return reserved.includes(trimmed) ? `'${trimmed}'` : trimmed;
  });
}

// helmet 옵션 생성 함수
function createHelmetOptions() {
  const directives = {
    defaultSrc: parseCspDirective('CSP_DEFAULT_SRC') || ["'self'"],
    scriptSrc: parseCspDirective('CSP_SCRIPT_SRC'),
    styleSrc: parseCspDirective('CSP_STYLE_SRC'),
    fontSrc: parseCspDirective('CSP_FONT_SRC'),
    imgSrc: parseCspDirective('CSP_IMG_SRC'),
    connectSrc: parseCspDirective('CSP_CONNECT_SRC'),
  };
  // undefined directive 제거
  Object.keys(directives).forEach(key => {
    if (!directives[key]) delete directives[key];
  });
  return { contentSecurityPolicy: { directives } };
}

const helmetOptions = createHelmetOptions();

const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  },
});

// 정적 파일 라우트는 rate limit보다 먼저 등록
app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/assets', express.static(path.join(__dirname, 'client/assets')));
app.use('/images', express.static(path.join(__dirname, 'client/images')));
app.use(express.static(path.join(__dirname, 'client')));

// helmet, logger 등 기타 미들웨어
app.use(helmet(helmetOptions));
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// rate limit: 정적 파일은 제외
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    skip: req =>
      req.path.startsWith('/js/') ||
      req.path.startsWith('/css/') ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/images/'),
  }),
);

app.use(cors());

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use('/', rootRouter);

export default app;
