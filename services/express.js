const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// parse application/json
app.use(bodyParser.json());

//rotutes
app.use(require('../routes/index'));



const initExpress = ()=>{

    app.listen(process.env.PORT, () => {
        console.log("escuchando puerto ", process.env.PORT)
    });
}




module.exports = initExpress;