const express = require('express');
const app = express();


var routes = require('./routes.js');



app.use('/',routes);

app.listen(8080);
