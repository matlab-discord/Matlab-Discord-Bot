const util = require('util');

// Host site for url fetch
const host = 'https://chart.apis.google.com/chart?';

async function latex2pngurl(latex) {
    // Establish paramters that configure the look of the latex
    const config = {
        bgcolor: '36393F',
        alpha: '80',
        textcolor: 'FFFFFF',
        height: 40,
    };

    // Build the latex URL relevent to our host
    return util.format('%scht=tx&chl=%s&chs=%d&chf=bg,s,%s%s&chco=%s', host, encodeURIComponent(latex), config.height, config.bgcolor, config.alpha, config.textcolor);

}

// could maybe use for more encoding options? don't think it's necessary
// function urlencode(str) {
//     str = (str + '').toString();

//     // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
//     // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
//     return encodeURIComponent(str)
//       .replace('!', '%21')
//       .replace('\'', '%27')
//       .replace('(', '%28')
//       .replace(')', '%29')
//       .replace('*', '%2A')
//       .replace('%20', '+');
//   }

module.exports = latex2pngurl;
