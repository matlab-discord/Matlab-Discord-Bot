const mustache  = require('mustache');
const fs        = require('fs');

const readFiles = function (dirname, encoding = 'utf8') {
    const files = {};
    fs.readdirSync(dirname).forEach(filename => {
        files[filename] = fs.readFileSync(dirname + filename, encoding);
    });
    return files;
};

const templates = readFiles('./msg/');

for (let key in templates) {
    if (templates.hasOwnProperty(key)) {
        mustache.parse(templates[key]);
    }
}

module.exports = templates