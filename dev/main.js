/*
const {searchDocs, getNewestBlogEntry, getNewestVideo} = require('../src/mathworks-docs');
getNewestVideo().then(console.log);
*/

const why = require('../src/why');
for(let i = 0; i < 50; i++){
    console.log(why());
}
