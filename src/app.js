const cors = require('cors');
const express = require('express');
const apiRoutes = require('./api/routes');
const { loadSecrets } = require('./api/secrets');
const { setupDb } = require('./api/db/db');

const app = express();
app.use(express.json());

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['not sure yet']
    : ['http://localhost:3001'];
app.use(
  cors({
    // https://medium.com/zero-equals-false/using-cors-in-express-cac7e29b005b
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use('/api', apiRoutes);
app.use(express.static('client/public'));

let appStarted = false;

const startApp = async () => {
  if (!appStarted) {
    console.log('Setting up app...');
    await loadSecrets();
    setupDb();
    appStarted = true;
    console.log('App ready');
  }
  return app;
};

module.exports = { startApp };
