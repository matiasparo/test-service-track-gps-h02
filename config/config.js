// configuro variables
const dotenv = require('dotenv');
dotenv.config();

//PUERTO
process.env.PORT = process.env.PORT || 4041
process.env.IP = process.env.IP || 'localhost'

process.env.URLDB = process.env.MONGO_URI;

process.env.SEED = process.env.SEED || 'WkwuBGCkroADlxJvElFab2jRGT12q0zo';
