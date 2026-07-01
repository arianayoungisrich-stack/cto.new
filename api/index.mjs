// Vercel serverless function — uses the pre-built SSR handler
import server from '../dist/server/server.js';

export default async function handler(request) {
  return server.fetch(request);
}