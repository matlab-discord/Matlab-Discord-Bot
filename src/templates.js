const fs = require('fs');

const readFiles = function (dirname, encoding = 'utf8') {
    const files = {};
    fs.readdirSync(dirname).forEach((filename) => {
        files[filename] = fs.readFileSync(dirname + filename, encoding);
    });
    return files;
};

const templates = readFiles('./msg/');

module.exports = templates;
