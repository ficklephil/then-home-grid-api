var express = require("express");
var logfmt = require("logfmt");
var request = require("request");
var QueryParametersUtil = require("./src/QueryParametersUtil.js");
var DivToPixelUtil = require("./src/DivToPixelUtil.js");
var Q = require("q");
var app = express();

var divToPixelUtil = new DivToPixelUtil();

app.use(logfmt.requestLogger());

app.get('/', function (req, res) {

    var queryParametersUtil = new QueryParametersUtil(req);
    var missingParameters = queryParametersUtil.getMissingParameters();

    if (missingParameters.length > 0) {
        res.send(queryParametersUtil.getMissingParametersJson());
    } else {
        nestoriaSearch(req, function (body) {
            if (isNestoria(body)) {
                addThenHomeParametersToNestoria(body, req, function (body) {
                    res.send(body);
                });
            } else {
                res.send(sendErrorMessage(body));
            }
        });
    }
});

function nestoriaSearch(req, callback) {

    var nestoriaSearchUrl = constructNestoriaSearchUrl(req.query);
    nestoriaRequest(nestoriaSearchUrl, callback);
}

function sendErrorMessage(body) {

    if (body.hasOwnProperty("error")) {
        return body;
    } else {
        return nestoriaCannotFindText();
    }
}

function isNestoria(body) {

    return body.hasOwnProperty("response");
}

function nestoriaRequestError(error) {
    return {text: 'The following Nestoria Request error occurred', errorLocation: 'Node', error: error};
}

function nestoriaCannotFindText() {

    return {text: 'Nestoria is not returning a JSON feed. Please check URL to Nestoria.', errorLocation: 'Node'}
}

function addThenHomeParametersToNestoria(body, req, callback) {

    var queryParameters = req.query;
    var nestoriaRequestBody = body.request;

    var itemLat;
    var itemLng;

    var screenResolutionX = queryParameters.screenResolutionX;
    var screenResolutionY = queryParameters.screenResolutionY;

    nestoriaRequestBody.screenResolutionX = screenResolutionX;
    nestoriaRequestBody.screenResolutionY = screenResolutionY;

    nestoriaRequestBody.additionalPlaceName = '';

    var listings = body.response.listings;

    if (listings) {
        for (var i = 0; i < listings.length; i++) {

            itemLat = listings[i].latitude;
            itemLng = listings[i].longitude;

            divToPixelUtil.convertCoordToDivPixel(screenResolutionX, screenResolutionY, itemLat, itemLng,
                queryParameters.latLo, queryParameters.lngLo, queryParameters.latHi, queryParameters.lngHi);

            //Longitude is X, Latitude is Y
            listings[i].longitudeXCoor = Math.round(divToPixelUtil.getDivPixelLng());
            listings[i].latitudeYCoor = Math.round(divToPixelUtil.getDivPixelLat());
        }
    }

    callback(body);
}

function constructNestoriaSearchUrl(queryParamaters) {

    var nestoriaUrl = 'http://api.nestoria.co.uk/api?country=uk&page=' + queryParamaters.page +
        '&pretty=1&action=search_listings&centre_point=' + queryParamaters.centralLat + ',' +
        queryParamaters.centralLng + ',0.625mi&encoding=json&listing_type=buy&number_of_results=15&' +
        'property_type=all&bedroom_min=0&bedroom_max=100&price_min=' + queryParamaters.minPrice +
        '&price_max=' + queryParamaters.maxPrice + '&updated_min=' + queryParamaters.updatedMin;
    return nestoriaUrl;
}

/**
 * Example url :
 *
 * http://localhost:5000/?screenResolutionX=23232&screenResolutionY=23232&updatedMin=1370822400&
 *      maxPrice=2000000&minPrice=0&centralLng=-0.371348&centralLat=51.490994&page=0
 * @param url
 * @returns {promise}
 */
function nestoriaRequest(url, callback) {

    var deferred = Q.defer();
    var options = {
        url: url,
        timeout: 2000,
        json: true
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            deferred.resolve(callback(body));
        } else {
            deferred.resolve(callback(nestoriaRequestError(error)));
        }
    });
    return deferred.promise;
}

var port = Number(process.env.PORT || 5000);

app.listen(port, function () {

    console.log('listening on ' + port);
});