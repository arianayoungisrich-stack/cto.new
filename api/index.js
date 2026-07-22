export default async function handler(req) {
  const server = await import('../dist/server/server.js');
  const handlerObj = server.default || server;
  const response = await handlerObj.fetch(req);
  return response;
}
