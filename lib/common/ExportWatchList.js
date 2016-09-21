'use strict';

let _ = require('lodash');
let ConnectMongo = require('./ConnectMongo');
let co = require('co');

module.exports = ExportWatchList;

function ExportWatchList(mongoConfig, criteria, fields) {
    this.mongoConfig = mongoConfig || {};
    this.criteria = criteria || {};
    this.fields = fields || {};
}

ExportWatchList.prototype.execute = function(callback) {

    if (!callback || typeof callback != 'function') {
        console.log('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
        return;
    }

    co(function* () {
        let results = yield queryWatchList.call(this);
        if (results.length > 0) {
            yield insertWatchList.call(this, results);
        }

    }.bind(this)).catch(err => {
        console.log(err);
    });

    function* queryWatchList() {
        let exportDb = yield this._getExportDbPromise();
        let cursor = exportDb.collection(this.mongoConfig.exportCollection).find(this.criteria, this.fields);
        let results = yield cursor.toArray();
        console.log(`query ${results.length} watch-lists, criteria: ${JSON.stringify(this.criteria)}`);
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
        this.mongoConfig.exportUsername,
        this.mongoConfig.exportPassword);
};

ExportWatchList.prototype._getImportDbPromise = function() {
    return ConnectMongo(this.mongoConfig.importUrl,
        this.mongoConfig.importUsername,
        this.mongoConfig.importPassword);
};
