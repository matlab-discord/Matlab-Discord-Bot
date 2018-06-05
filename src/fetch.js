const request = require('request');
const cheerio = require('cheerio');

const fetch = (url, type = 'html') => {
    return new Promise((resolve, reject) => {
        request(url, function (error, res, html) {
            if (error) {
                reject(error);
            }
            if (type === 'json') {
                try{
                    resolve(JSON.parse(html));
                }
                catch(error){
                    reject(error);
                }
            } else {
                resolve(cheerio.load(html));
            }
        });
    });
};

module.exports = fetch;