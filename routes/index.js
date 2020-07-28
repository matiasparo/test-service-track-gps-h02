const express = require('express');
const app = express();


app.use( require('./tracker') );
app.use('/api', require('./tracker'));
app.use('/api', require('./device'));


module.exports = app;