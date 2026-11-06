// Local dev server: node server.js
const http = require('http');
const handler = require('./app');
const PORT = process.env.PORT || 3000;
http.createServer(handler).listen(PORT, () => console.log(`\n  FrostBite site : http://localhost:${PORT}\n  Admin portal   : http://localhost:${PORT}/admin\n`));
