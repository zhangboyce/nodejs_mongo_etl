'use strict';

let mongoClient = require('mongodb').MongoClient;
let logger = require('tracer').colorConsole();

module.exports = function(url, username, password) {
    return new Promise((resolve, reject) => {
        mongoClient.connect(url, (err, db) => {
            logger.info("Begin to connect mongo db: " + url);
            if (username && password) {
                let adminDb = db.admin();
                adminDb.authenticate(username, password, function (err, result) {
                    if (err) {
                        reject(err);
                        logger.info("Connect mongo db: " + url + " error.");
                    } else {
                        resolve(db);
                        logger.info("Connect mongo db: " + url + " successfully.");
                    }
                });
            } else {
                if (err) {
                    logger.info("Connect mongo db: " + url + " error.");
                    reject(err);
                } else {
                    resolve(db);
                    logger.info("Connect mongo db: " + url + " successfully.");
                }
            }
        });
    });
};