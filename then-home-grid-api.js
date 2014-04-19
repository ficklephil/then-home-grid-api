var express = require("express");
var logfmt = require("logfmt");
var QueryParametersUtil = require("./src/QueryParametersUtil.js");

var app = express();

app.use(logfmt.requestLogger());

app.get('/', function (req, res) {

    var queryParametersUtil = new QueryParametersUtil(req);
    var missingParameters = queryParametersUtil.getMissingParameters();

    if(missingParameters.length > 0){
        res.send(queryParametersUtil.getMissingParametersJson());
    }else
    {
        
        res.send('Lets Go!');
    }
});


var port = Number(process.env.PORT || 5000);
app.listen(port, function () {
    console.log('listening on ' + port);
});
