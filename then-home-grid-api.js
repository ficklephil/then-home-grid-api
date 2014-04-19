var express = require("express");
var logfmt = require("logfmt");
var request = require("request");
var QueryParametersUtil = require("./src/QueryParametersUtil.js");
var Q = require("q");
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function (req, res) {

    var queryParametersUtil = new QueryParametersUtil(req);
    var missingParameters = queryParametersUtil.getMissingParameters();

    if (missingParameters.length > 0) {
        res.send(queryParametersUtil.getMissingParametersJson());
    } else {
        nestoriaSearch(req, function (body) {
            addThenHomeParametersToNestoria(body, req, function(body){
                res.send(body);
            });
        });
    }
});

function addThenHomeParametersToNestoria(body, req, callback) {

    var queryParameters = req.query;
    var nestoriaRequestBody = body.request;

    var itemLat;
    var itemLng;
    var latLo = queryParameters.latLo;
    var lngLo = queryParameters.lngLo;
    var latHi = queryParameters.latHi;
    var lngHi = queryParameters.lngHi;

    var screenResolutionX = queryParameters.screenResolutionX;
    var screenResolutionY = queryParameters.screenResolutionY;

    nestoriaRequestBody.screenResolutionX = screenResolutionX;
    nestoriaRequestBody.screenResolutionY = screenResolutionY;

    nestoriaRequestBody.additionalPlaceName = 'bean land';

    var listings = body.response.listings;

    if (listings) {
        for (var i = 0; i < listings.length; i++) {

            itemLat = listings[i].latitude;
            itemLng = listings[i].longitude;

            convertCoordToDivPixel(screenResolutionX, screenResolutionY, itemLat, itemLng, latLo, lngLo, latHi, lngHi);

            //Longitude is X, Latitude is Y
            listings[i].longitudeXCoor = Math.round(getDivPixelLng());
            listings[i].latitudeYCoor = Math.round(getDivPixelLat());
        }
    }

//    var jsonBody = JSON.stringify(body);
    callback(body);
}

//remove to new class
var _divPixelLat;
var _divPixelLng;

function convertCoordToDivPixel(screenResolutionX,screenResolutionY,item_lat,item_lng,lat_lo,lng_lo,lat_hi,lng_hi)
{
    var latitudePixelsFromTop = screenResolutionY - calcLatOrLngInPixels(screenResolutionY,lat_hi,lat_lo,item_lat);
    var longitudePixels = calcLatOrLngInPixels(screenResolutionX,lng_hi,lng_lo,item_lng);

    _divPixelLat = latitudePixelsFromTop;
    _divPixelLng = longitudePixels;
}

/**
 * Calculates the Latitude or Longitude in Pixels
 * depending on the screen resolution, and high and low values in this case
 * the high and low values being the latitude/longitude high and latitude/longitude low
 *
 * @inputs screenResolution a screen resolution either x or y ie. 1024
 * high value ie. latitude high ie. lat_hi from the NE bound
 * low value ie. latitude low ie. lat_lo from the SW bound
 * item value ie. latitude of the item
 * @return Number ie. pixels
 */
function calcLatOrLngInPixels(screenResolution,highValue,lowValue,itemValue){
    var ratioLatitudeToPixel = screenResolution / (highValue - lowValue);
    var itemsLatitudeRelativeToBottom = itemValue - lowValue;
    return itemsLatitudeRelativeToBottom * ratioLatitudeToPixel;
}

function getDivPixelLat()
{
    return _divPixelLat;
}

function getDivPixelLng()
{
    return _divPixelLng;
}

function nestoriaSearch(req, callback) {

    var nestoriaSearchUrl = constructNestoriaSearchUrl(req.query);
    nestoriaRequest(nestoriaSearchUrl, callback);
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
        json:true
    };

    request(options, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            deferred.resolve(callback(body));
        } else {
//            deferred.resolve(createArticleErrorDescrition(articleUrl, error));
        }
    });
    return deferred.promise;
}

var port = Number(process.env.PORT || 5000);
app.listen(port, function () {
    console.log('listening on ' + port);
});
