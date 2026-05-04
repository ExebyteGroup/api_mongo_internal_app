const http = require('http');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ username: 'admin' }, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '12h' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/customers?page=1&limit=10',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + token
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});
req.end();
