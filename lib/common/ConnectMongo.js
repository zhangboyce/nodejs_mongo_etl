'use strict';

let mongoClient = require('mongodb').MongoClient;

module.exports = function(url, username, password) {
    return mongoClient.connect(url).then(db => {
        if (username && password) {
            let adminDb = db.admin();
            adminDb.authenticate(username, password);
        }
        console.log("Connect mongo db: " + url);

        let close = db.close;
        db.close = () => {
            //console.log('close db!!!' + url);
            close.call(db);
        };

        return db;
    }).catch(err => {
        console.log("Connect mongo db: " + url + " error." + err);
    });
};