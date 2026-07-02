const server = require('./ssr.js');
module.exports = async function handler(req) {
  const response = await server.fetch(req);
  return response;
};