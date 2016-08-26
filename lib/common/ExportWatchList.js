'use strict';

let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./ConnectMongo');

let mongo_config_pro = require('./Constant').mongo_config.pro;
let mongo_config_dev = require('./Constant').mongo_config.dev;

module.exports = function() {
    function ExportWatchList(mongoConfig) {
        let mConfig = mongoConfig || {};

        this.exportUrl = mConfig.exportUrl;
        this.exportCollection = mConfig.exportCollection;
        this.exportUsername = mConfig.exportUsername || mongo_config_pro.username;
        this.exportPassword = mConfig.exportPassword || mongo_config_pro.password;

        this.importUrl = mConfig.importUrl;
        this.importCollection = mConfig.importCollection;
        this.importUsername = mConfig.importUsername;
        this.importPassword = mConfig.importPassword;
    }

    ExportWatchList.prototype.execute = function(callback) {
        if (!callback || typeof callback != 'function') {
            logger.error('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
            return;
        }

        this._getExportDbPromise().then(db => {
            return new Promise((resolve, reject) => {
                db.collection(this.exportCollection).find({}, (err, results) => {
                    if (err) reject(err);
                    results.toArray((err, items) => {
                        logger.debug(`query ${items.length} watch list from ${this.exportCollection}`);
                        resolve(items);
                        db.close();
                    });
                });
            });
        }).then(results => {
            this._getImportDbPromise().then(db => {
                let batch = db.collection(this.importCollection).initializeUnorderedBulkOp({useLegacyOps: true});
                _.forEach(results, result => {
                    let data = callback(result);
                    batch.find({originId: data.originId, type: data.type}).upsert().updateOne(data);
                    logger.debug('upsert a feedSources: %s', JSON.stringify(data));
                });

                batch.execute((err, result) => {
                    if (err) logger.error(err);
                    logger.debug('Inserted result: ' + JSON.stringify(result));

                    db.close();
                });
            });
        }).catch(err => {
            logger.err(err);
        });
    };

    ExportWatchList.prototype._getExportDbPromise = function() {
        return ConnectMongo(this.exportUrl, this.exportUsername, this.exportPassword);
    };

    ExportWatchList.prototype._getImportDbPromise = function() {
        return ConnectMongo(this.importUrl, this.importUsername, this.importPassword);
    };

    return ExportWatchList;
};