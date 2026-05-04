const express = require('express');
const app = express();
app.get('/test', (req, res) => {
  res.json({ search: req.query.search, type: typeof req.query.search, bool: !!req.query.search });
});
const server = app.listen(0, async () => {
  const port = server.address().port;
  const http = require('http');
  http.get(`http://localhost:${port}/test?search=`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(data);
      server.close();
    });
  });
});
