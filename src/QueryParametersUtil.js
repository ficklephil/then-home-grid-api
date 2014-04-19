var REQUIRED_PARAMETERS = ['screenResolutionX', 'screenResolutionY'];
var missingParameters;

function QueryParametersUtil(req) {

    missingParameters = [];

    for (var parameter in REQUIRED_PARAMETERS) {

        var parameterToCheck = REQUIRED_PARAMETERS[parameter];

        if (!req.query.hasOwnProperty(parameterToCheck)) {
            missingParameters.push(parameterToCheck);
        }
    }
};

/**
 * Returns an array of the missing parameters, using the
 * required parameters list as reference, above.
 *
 * @returns {Array}
 */
QueryParametersUtil.prototype.getMissingParameters = function () {

    return missingParameters;
};

QueryParametersUtil.prototype.getMissingParametersJson = function () {

    var missingParametersJson = new Object();
    missingParametersJson.text = 'The following parameters are missing from the' +
        ' request.';
    missingParametersJson.missingParameters = missingParameters;

    return missingParametersJson;
};

module.exports = QueryParametersUtil;