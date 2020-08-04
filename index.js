
const express = require('express');
const bodyparser = require('body-parser');
const routes = require('./app/routes/route');
app = new express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/', routes);
app.listen(8080);
