/* eslint-disable import/prefer-default-export */
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 10;

export const rateLimitMiddleware = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  skip: req =>
    req.path.startsWith('/js/') ||
    req.path.startsWith('/css/') ||
    req.path.startsWith('/assets/') ||
    req.path.startsWith('/images/'),
  message: {
    status: 'tooManyRequests',
    code: 429,
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.',
  },
});
