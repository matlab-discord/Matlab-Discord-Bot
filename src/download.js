const request = require("request");
const fs = require("fs");

const download = function (uri, filename, callback) {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
};

module.exports = download