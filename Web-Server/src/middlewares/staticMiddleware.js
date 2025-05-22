import express from 'express';

export function staticMiddleware(__dirname) {
  const staticPaths = ['client', 'client/js', 'client/css', 'client/assets', 'client/images'];
  return staticPaths.map(p => express.static(`${__dirname}/${p}`));
}
