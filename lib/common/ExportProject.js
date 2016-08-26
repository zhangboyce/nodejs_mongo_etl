'use strict';

let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./ConnectMongo');

let mongo_config_pro = require('./Constant').mongo_config.pro;
let mongo_config_dev = require('./Constant').mongo_config.dev;

module.exports = function() {
    function ExportProject(mongoConfig, type) {
        let mConfig = mongoConfig || {};

        this.exportUrl = mConfig.exportUrl;
        this.exportCollection = mConfig.exportCollection;
        this.exportUsername = mConfig.exportUsername || mongo_config_pro.username;
        this.exportPassword = mConfig.exportPassword || mongo_config_pro.password;

        this.importUrl = mConfig.importUrl;
        this.importCollection = mConfig.importCollection;
        this.importUsername = mConfig.importUsername;
        this.importPassword = mConfig.importPassword;

        this.feedSourcesUrl = mConfig.feedSourcesUrl;
        this.feedSourcesCollection = mConfig.feedSourcesCollection;
        this.feedSourcesUsername = mConfig.feedSourcesUsername;
        this.feedSourcesPassword = mConfig.feedSourcesPassword;

        this.type = type;
    }

    /**
     *
     * @param callback
     */
    ExportProject.prototype.execute = function(callback) {
        if (!callback || typeof callback != 'function') {
            logger.error('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
            return;
        }

        this._getFeedSourcesDbPromise().then(feedSourcesDb => {
            return new Promise((resolve, reject) => {
                feedSourcesDb.collection(this.feedSourcesCollection).find({type: this.type}, (err, results) => {
                    if (err) reject(err);
                    results.toArray((err, items) => {
                        if (err) reject(err);
                        if (items.length == 0) {
                            resolve(null);
                        } else {
                            let feedSources = {}
                            for (let i=0; i< items.length; i++) {
                                let result = items[i];
                                let originId = result.originId;
                                feedSources[originId.replace(this.type + '/','')] = result._id;
                            }
                            resolve(feedSources);
                        }
                        logger.debug(`query ${items.length} feed sources from ${this.feedSourcesCollection}`);
                        feedSourcesDb.close();
                    });
                });
            });
        }).then(feedSources => {
            if (!feedSources) {
                logger.warn(`No ${this.type} feedsources.`);
                return null;
            }
            return this._getExportDbPromise().then(exportDb => {
                return new Promise((resolve, reject) => {
                    exportDb.collection(this.exportCollection).count({}, (err, count) => {
                        if (err) reject(err);
                        resolve({count: count, feedSources: feedSources, exportDb: exportDb});
                    });
                });
            });
        }).then(datas => {
            if (!datas || !datas.count || !datas.feedSources || !datas.exportDb) return null;
            logger.info(`Query ${datas.count} projects from ${this.exportUrl}`);

            let count = datas.count;
            let feedSources = datas.feedSources;
            let exportDb = datas.exportDb;

            this._getImportDbPromise().then(importDb => {
                let num = 0;
                this._forEachQuery(exportDb, count, cursor => {
                    Promise.resolve(cursor).then(cursor => {
                        return this._handleProjectPromise(cursor, callback, feedSources);
                    }).then(items => {
                        this._insertProject(items, importDb, (err, result) => {

                            num += items.length;
                            console.log('================> ' + num + ', ' + count);

                            if (num >= count) {
                                importDb && importDb.close();
                                exportDb && exportDb.close();
                                logger.info('> Exporting completed!');
                            }
                            if (err) logger.error(err);

                            logger.info(`> Inserted ${num} projects.`);
                            logger.debug(JSON.stringify(items[0]));
                            logger.debug('Inserted result: ' + JSON.stringify(result));
                        });
                    });
                });
            });
        }).catch(err => {
            logger.error(err);
        });
    };

    ExportProject.prototype._getFeedSourcesDbPromise = function() {
        return ConnectMongo(this.feedSourcesUrl, this.feedSourcesUsername, this.feedSourcesPassword);
    };

    ExportProject.prototype._getExportDbPromise = function() {
        return ConnectMongo(this.exportUrl, this.exportUsername, this.exportPassword);
    };

    ExportProject.prototype._getImportDbPromise = function() {
        return ConnectMongo(this.importUrl, this.importUsername, this.importPassword);
    };

    ExportProject.prototype._handleProjectPromise = function(cursor, callback, feedSources) {
        return new Promise((resolve, reject) => {
            cursor.toArray((err, results) => {
                if (err) reject(err);
                let items = [];
                _.each(results, result => {
                    if (!result) return;
                    let item = callback(result, feedSources);
                    if (item) items.push(item);
                });
                resolve(items);
            });
        });
    };

    ExportProject.prototype._insertProject = function(items, importDb, callback) {
        let batch = importDb.collection(this.importCollection).initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(items, result => {
            batch.find({feed: result.feed, originUrl: result.originUrl, type: result.type})
                .upsert().updateOne(result);
        });
        batch.execute((err, result) => {
            callback(err, result);
        });
    };

    ExportProject.prototype._forEachQuery = function(exportDb, count, callback) {
        let range = 100;
        let step = Math.floor(count / range) + 1;
        for (let i = 0; i < step; i++) {
            let skip = range * i;
            let limit = range;

            let cursor = exportDb.collection(this.exportCollection).find({}, {}, {skip: skip, limit: limit});

            logger.info(`Query projects from ${this.exportUrl} skip: ${skip}, limit: ${limit}`);

            callback(cursor);
        }
    };

    return ExportProject;
};