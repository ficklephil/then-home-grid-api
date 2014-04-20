var divPixelLat;
var divPixelLng;

function DivToPixelUtil() {
};

DivToPixelUtil.prototype.convertCoordToDivPixel = function (screenResolutionX, screenResolutionY, itemLat, itemLng,
                                                                latLo, lngLo, latHi, lngHi) {

    var latitudePixelsFromTop = screenResolutionY - calcLatOrLngInPixels(screenResolutionY, latHi, latLo, itemLat);
    var longitudePixels = calcLatOrLngInPixels(screenResolutionX, lngHi, lngLo, itemLng);

    divPixelLat = latitudePixelsFromTop;
    divPixelLng = longitudePixels;
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
function calcLatOrLngInPixels(screenResolution, highValue, lowValue, itemValue) {
    var ratioLatitudeToPixel = screenResolution / (highValue - lowValue);
    var itemsLatitudeRelativeToBottom = itemValue - lowValue;
    return itemsLatitudeRelativeToBottom * ratioLatitudeToPixel;
}

DivToPixelUtil.prototype.getDivPixelLat = function(){
    return divPixelLat;
}

DivToPixelUtil.prototype.getDivPixelLng = function() {
    return divPixelLng;
}

module.exports = DivToPixelUtil;