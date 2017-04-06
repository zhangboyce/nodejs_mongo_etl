'use strict';

let _ = require('lodash');
let co = require('co');
let utils = require('./utils');
let Context = require('./Context');
let Constant = require('../execute/Constant');

module.exports = ExportWatchList;

function ExportWatchList(mongoConfig, criteria, fields, type) {
    this.mongoConfig = mongoConfig || {};
    this.criteria = criteria || {};
    this.fields = fields || {};
    this.type = type;
}

ExportWatchList.watchListMongoConfig = function(exportCollection, exportDb) {
    return {
        exportDb: exportDb || Constant.MONGO_EXPORT_RAW,
        exportCollection: exportCollection,

        importDb: Constant.MONGO_IMPORT,
        importCollection: 'feedsources'
    };

};

ExportWatchList.exportWatchList = function(options, mongoConfig, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {'importio': 0};

    let exportWatchList = new ExportWatchList(mongoConfig, criteria, fields, type);
    exportWatchList.execute(convertorFtn(type));
};

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
        console.log(`query ${results.length} ${ this.type }, criteria: ${JSON.stringify(this.criteria)}`);

        return results;
    }

    function* insertWatchList(results) {
        let importDb = yield this._getImportDbPromise();
        let batch = importDb.collection(this.mongoConfig.importCollection).initializeUnorderedBulkOp({useLegacyOps: true});
        _.forEach(results, result => {
            let data = callback(result);
            batch.find({originId: data.originId, type: data.type}).upsert().updateOne(data);
            console.log('Upsert a feedSources: ' + JSON.stringify(data));
        });

        let result = yield batch.execute();
        console.log('Inserted result: ' + JSON.stringify(result));
    }
};

ExportWatchList.prototype._getExportDbPromise = function() {
    return Context.get(this.mongoConfig.exportDb);
};

ExportWatchList.prototype._getImportDbPromise = function() {
    return Context.get(this.mongoConfig.importDb);
};
