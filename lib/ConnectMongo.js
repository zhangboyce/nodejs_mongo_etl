'use strict';

let mongoClient = require('mongodb').MongoClient;
let Promise = require('bluebird');
let logger = require('tracer').colorConsole();

module.exports = function(url, username, password) {
    if (!url) {
        logger.error('mongo url cannot be null.');
        return null;
    }

    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            if (username && password) {
                let adminDb = db.admin();
                adminDb.authenticate(username, password, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(db);
                    }
                });
            } else {
                if (err) {
                    reject(err);
                } else {
                    resolve(db);
                }
            }
        });
    });
};