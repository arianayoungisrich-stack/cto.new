import server from './ssr.mjs';
export default async function handler(req) {
  return server.fetch(req);
}
