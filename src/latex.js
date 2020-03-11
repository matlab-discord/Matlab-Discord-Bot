const fetch = require('./fetch');
const querystring = require('querystring');
const util = require('util');

// Host site for url fetch
const host = 'https://latex.codecogs.com';

async function latex2pngurl(latex){

    // Establish paramters that configure the look of the latex
    const params = {
        latex: latex,
        filetype: 'png',
        bgcolor: 'white',
        dpi: 150,
        size: 'large'
    }

    // Build the latex URL relevent to our host
    const url = util.format('%s/%s.latex?\\dpi{%d}&space;\\bg_%s&space;\\%s&space;%s', host, params.filetype, params.dpi, params.bgcolor, params.size, latex);
    return url;
}

module.exports = latex2pngurl;


// http://latex2png.com/?latex=y+%3D+%5Csum_%7Bi%3D0%7D%5E%7B50%7D+x_i&res=300&color=FFFFFF&x=100&y=20