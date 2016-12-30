'use strict';

let mongoClient = require('mongodb').MongoClient;
module.exports = url => {
    return mongoClient.connect(url).then(db => {
        console.log("Connect mongo db: " + url);
        return db;
    }).catch(err => {
        console.log("Connect mongo db: " + url + " error." + err);
    });
};