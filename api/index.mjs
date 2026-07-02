import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const server = require('./ssr.mjs');
export default async function handler(req) {
  const response = await server.fetch(req);
  return response;
}