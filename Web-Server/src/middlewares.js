import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const RESERVED_CSP = ['self', 'none', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic', 'report-sample'];

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 10;

function parseCspDirective(envKey) {
  const value = process.env[envKey];
  if (!value) return undefined;
  return value.split(',').map(s => {
    const trimmed = s.trim();
    return RESERVED_CSP.includes(trimmed) ? `'${trimmed}'` : trimmed;
  });
}

function createHelmetOptions() {
  const directives = {
    defaultSrc: parseCspDirective('CSP_DEFAULT_SRC') || ["'self'"],
    scriptSrc: parseCspDirective('CSP_SCRIPT_SRC'),
    styleSrc: parseCspDirective('CSP_STYLE_SRC'),
    fontSrc: parseCspDirective('CSP_FONT_SRC'),
    imgSrc: parseCspDirective('CSP_IMG_SRC'),
    connectSrc: parseCspDirective('CSP_CONNECT_SRC'),
  };
  Object.keys(directives).forEach(key => {
    if (!directives[key]) delete directives[key];
  });
  return { contentSecurityPolicy: { directives } };
}

export function staticMiddleware(__dirname) {
  const staticPaths = ['client', 'client/js', 'client/css', 'client/assets', 'client/images'];
  return staticPaths.map(p => express.static(`${__dirname}/${p}`));
}

export const helmetMiddleware = helmet(createHelmetOptions());
export const loggerMiddleware = morgan('dev');
export const jsonMiddleware = express.json();
export const urlencodedMiddleware = express.urlencoded({ extended: true });

export const rateLimitMiddleware = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  skip: req =>
    req.path.startsWith('/js/') ||
    req.path.startsWith('/css/') ||
    req.path.startsWith('/assets/') ||
    req.path.startsWith('/images/'),
  message: {
    status: 'error',
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  },
});

export const corsMiddleware = cors();

export function requestLoggerMiddleware(req, res, next) {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
}
