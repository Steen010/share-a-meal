const express = require('express')
const port = 3000;
const assert = require('assert');
const app = express();
const userRoutes = require('./src/routes/user.routes');
const logger = require("./src/util/utils").logger;

app.use(express.json());

app.use('*', (req, res, next) => {
    const method = req.method;
    const url = req.originalUrl;
    console.log(`methode ${method} is aangeroepen`);
    next();
});

// check if correct
app.get('/api/info', (req, res) => {
    res.status(200).json(
        {
            status: 200,
            message: 'server info-endpoint',
            data: {
                studentName: 'Ammar',
                studentNumber: 1234567,
                description: 'welkom bij de server API van de share a meal'
            }

        });
});

//this goes to a route, see src/routes/user.routes.js
app.use('/api/user', userRoutes);

// Wanneer geen enkele endpoint matcht kom je hier terecht. Dit is dus
// een soort 'afvoerputje' (sink) voor niet-bestaande URLs in de server.
app.use('*', (req, res) => {
    logger.warn('Invalid endpoint called: ', req.path);
    res.status(404).json({
      status: 404,
      message: 'Endpoint not found',
      data: {}
    });
  });
  
  // Express error handler
  app.use((err, req, res, next) => {
    logger.error(err.code, err.message);
    res.status(err.code).json({
      statusCode: err.code,
      message: err.message,
      data: {}
    });
  });

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

module.exports = app;