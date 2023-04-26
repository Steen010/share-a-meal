const express = require('express')
const port = 3000;
const assert = require('assert');
const app = express();
const userRoutes = require('./src/routes/user.routes');

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

app.use((req, res, next) => {
    const url = req.originalUrl;
    console.log(`404-handler called for URL: ${url}`);
    res.status(404).json({
        status: 404,
        message: 'Not Found',
        data: {},
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
module.exports = app;
