'use strict';

let mongoClient = require('mongodb').MongoClient;

module.exports = function(url, username, password) {
    return mongoClient.connect(url).then(db => {
        console.log("Begin to connect mongo db: " + url);
        if (username && password) {
            let adminDb = db.admin();
            adminDb.authenticate(username, password);
        }
        console.log("Connect mongo db: " + url + " successfully.");
        return db;
    }).catch(err => {
        console.log("Connect mongo db: " + url + " error." + err);
    });
};