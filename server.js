const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8080;
// Serve the static files in the build folder
const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'build', req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  // Set the appropriate content type
  if (extname === '.js') {
    contentType = 'application/javascript';
  } else if (extname === '.css') {
    contentType = 'text/css';
  } else if (extname === '.json') {
    contentType = 'application/json';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
