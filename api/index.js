const server = require('../dist/server/server.js');

module.exports = async function handler(req) {
  const handlerObj = server.default || server;
  const response = await handlerObj.fetch(req);
  return response;
};