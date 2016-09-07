'use strict';

let _ = require('lodash');
let ConnectMongo = require('./ConnectMongo');
let co = require('co');

let mongo_config_pro = require('./Constant').mongo_config.pro;
let mongo_config_dev = require('./Constant').mongo_config.dev;

module.exports = function() {
    function ExportWatchList(mongoConfig) {
        this.mongoConfig = mongoConfig || {};
    }

    ExportWatchList.prototype.execute = function(callback) {

        if (!callback || typeof callback != 'function') {
            console.log('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
            return;
        }

        co(function* () {
            let results = yield queryWatchList.call(this);
            yield insertWatchList.call(this, results);

        }.bind(this)).catch(err => {
            console.log(err);
        });

        function* queryWatchList() {
            let exportDb = yield this._getExportDbPromise();
            let cursor = exportDb.collection(this.mongoConfig.exportCollection).find({});
            let results = yield cursor.toArray();
            console.log(`query ${results.length} watch list from ${this.mongoConfig.exportCollection}`);
            exportDb.close();

            return results;
        }

        function* insertWatchList(results) {
            let importDb = yield this._getImportDbPromise();
            let batch = importDb.collection(this.mongoConfig.importCollection).initializeUnorderedBulkOp({useLegacyOps: true});
            _.forEach(results, result => {
                let data = callback(result);
                batch.find({originId: data.originId, type: data.type}).upsert().updateOne(data);
                console.log('Upsert a feedSources: %s', JSON.stringify(data));
            });

            let result = yield batch.execute();
            console.log('Inserted result: ' + JSON.stringify(result));
            importDb.close();
        }
    };

    ExportWatchList.prototype._getExportDbPromise = function() {
        return ConnectMongo(this.mongoConfig.exportUrl,
            this.mongoConfig.exportUsername || mongo_config_pro.username,
            this.mongoConfig.exportPassword || mongo_config_pro.password);
    };

    ExportWatchList.prototype._getImportDbPromise = function() {
        return ConnectMongo(this.mongoConfig.importUrl,
            this.mongoConfig.importUsername,
            this.mongoConfig.importPassword);
    };

    return ExportWatchList;
};