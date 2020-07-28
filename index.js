require('./config/config');
const mongoose = require('mongoose');

const initExpress = require('./services/express');
const initServiceTracker = require('./services/tracker');


initExpress();
initServiceTracker();



mongoose.connect(process.env.URLDB, (error) => {
  if (error) throw error;

  console.log("Base de datos Online");
});




