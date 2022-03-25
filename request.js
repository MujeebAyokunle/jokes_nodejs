const request = require('request');

const callExternalApi = (url, callback) => {
    request(url, {json: true}, (err, res, body) => {
        if (err) {
            return callback(err);
        }
        return callback(body)
    })
}

module.exports.callApi = callExternalApi;