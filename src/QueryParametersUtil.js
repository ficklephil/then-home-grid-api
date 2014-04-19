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

module.exports = QueryParametersUtil;