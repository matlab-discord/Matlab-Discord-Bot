const searchDocs = require('../src/mathworks-docs');

searchDocs('interp1').then(console.log);

const mustache = require('mustache');
const fs = require('fs');

/*
const templates = {
    md_alt: fs.readFileSync('../msg/m_alt.md', 'utf8'),
};
mustache.parse(templates.md_alt);
*/

const readFiles = function (dirname, encoding = 'utf8') {
    const files = {};
    fs.readdirSync(dirname).forEach(filename => {
        files[filename] = fs.readFileSync(dirname + filename, encoding);
    });
    return files;
};

/*
 * Read template files and parse them in mustache.
 */
const templates = readFiles('../msg/');
for(let key in templates){
    mustache.parse(templates[key]);
}

// Example template
const result = {
    title: 'wtf',
    toolbox: '',
    url: 'lol.com'
};
console.log(mustache.render(templates['m.md'], {result}));

