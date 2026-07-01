import server from './server.mjs';
export default async function handler(request) {
  return server.fetch(request);
}
