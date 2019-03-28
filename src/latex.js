const fetch = require('./fetch');
const querystring = require('querystring');

const host = 'http://latex2png.com';

async function latex2pngurl(latex){
    const params = {
        latex: latex,
        color: 'FFFFFF',
        x: 100,
        y: 20,
        res: 200
    };
    const url = host + '/?' + querystring.stringify(params);
    const source = await fetch(url, 'text');
    const tokens = /document\.getElementById\("image_result"\)\.src = "(.+\.png)";/.exec(source);
    const imgage_url = host + tokens[1];
    return imgage_url;
}

module.exports = latex2pngurl;


// http://latex2png.com/?latex=y+%3D+%5Csum_%7Bi%3D0%7D%5E%7B50%7D+x_i&res=300&color=FFFFFF&x=100&y=20