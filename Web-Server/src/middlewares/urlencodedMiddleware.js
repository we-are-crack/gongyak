import express from 'express';

export const urlencodedMiddleware = express.urlencoded({ extended: true });
