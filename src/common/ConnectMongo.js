'use strict';

let mongoClient = require('mongodb').MongoClient;
module.exports = url => {
    let start = Date.now();
    return mongoClient.connect(url).then(db => {
        console.log(`Connect mongo db: ${ url }, and take: ${ (Date.now() - start)/1000 } s.`);
        return db;
    }).catch(err => {
        console.log("Connect mongo db: " + url + " error." + err);
    });
};