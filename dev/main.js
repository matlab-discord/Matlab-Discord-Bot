
/*
const fetch = require('../src/fetch');
fetch('https://twitter.com/MATLAB').then(function(doc){
    let firstTweet = doc('.js-stream-item.stream-item.stream-item').eq(0);
    console.log('https://twitter.com/MATLAB/status/' + firstTweet.attr('data-item-id'));
});
*/


const {searchDocs, getNewestBlogEntry, getNewestVideo, getNewestTweet} = require('../src/mathworks-docs');
getNewestTweet().then(console.log);


/*
const why = require('../src/why');
for(let i = 0; i < 50; i++){
    console.log(why());
}
*/

/*
const roll = require('../src/roll');
console.log(roll('fuck-1.4e+5f'));
*/