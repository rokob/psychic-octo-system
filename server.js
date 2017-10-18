const path = require('path');
const express = require('express');

const port = 3000;
const app = express();

app.use(express.static(path.join(__dirname)));
app.get('/index', function response(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
});
app.get('/main.js', function response(req, res) {
  res.sendFile(path.join(__dirname, './dist/main.js'));
});

app.get('/bork.js', function response(req, res) {
  res.sendFile(path.join(__dirname, './bork.js'));
});

app.get('/rollbar.js', function response(req, res) {
  res.sendFile(path.join(__dirname, './rollbar.umd.js'))
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
