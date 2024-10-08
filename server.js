'use strict';

require('dotenv').config();
const https = require('https');
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

// Connect to database
require('./dbFunctions').connect(process.env.MONGO_URI);

const app = express();

// Log all requests
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${Date.now()}: ${req.method} ${req.path} - ${req.ip}`);
  }
  next();
});

// Disable 'x-powered-by'
app.disable('x-powered-by');

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Sample front-end
app.route('/:project/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get((req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Setup SSL server, if enabled
const certOptions = {
  key: fs.readFileSync(path.resolve('certs/server.key')),
  cert: fs.readFileSync(path.resolve('certs/server.crt')),
};
let server;
let PORT;
if (!!process.env.ENABLE_SSL) {
  server = https.createServer(certOptions, app);
  PORT = 8443;
} else {
  server = app;
  PORT = 3000;
}

//Start our server and tests!
const listener = server.listen(PORT, () => {
  console.log(`Listening on port ${listener.address().port}`);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(() => {
      try {
        runner.run();
      } catch (e) {
        const error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
