import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const RESERVED_CSP = ['self', 'none', 'unsafe-inline', 'unsafe-eval', 'strict-dynamic', 'report-sample'];

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

export const helmetMiddleware = helmet(createHelmetOptions());
