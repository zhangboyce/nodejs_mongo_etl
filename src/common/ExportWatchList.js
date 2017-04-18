'use strict';

let _ = require('lodash');
let co = require('co');
let utils = require('./utils');
let config = require('config');
let ConnectMongo = require('./ConnectMongo');
let Constant = require('../execute/Constant');

module.exports = ExportWatchList;

function ExportWatchList(exportCollection, criteria, fields, type) {
    this.exportCollection = exportCollection;
    this.criteria = criteria || {};
    this.fields = fields || {};
    this.type = type;
}

ExportWatchList.exportWatchList = function(options, exportCollection, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {'importio': 0};

    let exportWatchList = new ExportWatchList(exportCollection, criteria, fields, type);
    exportWatchList.execute(convertorFtn(type));
};

ExportWatchList.prototype.execute = function(callback) {

    if (!callback || typeof callback != 'function') {
        console.log('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
        return;
    }

    co(function* () {
        try {
            let start = Date.now();
            this.importDb = yield this._getImportDbPromise();
            this.exportDb = yield this._getExportDbPromise();

            let results = yield queryWatchList.call(this);
            if (results.length > 0) {
                yield insertWatchList.call(this, results);
            }

            console.log(`> Export ${ this.type } feedSources completed, and take: ${ (Date.now() - start)/1000 } s.`);
        } catch (e) {
            console.log(e);
        }

        this.importDb.close();
        this.exportDb.close();

    }.bind(this));

    function* queryWatchList() {
        let cursor = this.exportDb.collection(this.exportCollection).find(this.criteria, this.fields);
        let results = yield cursor.toArray();
        console.log(`query ${results.length} ${ this.type }, criteria: ${JSON.stringify(this.criteria)}`);

        return results;
    }

    function* insertWatchList(results) {
        let batch = this.importDb.collection('feedsources').initializeUnorderedBulkOp({useLegacyOps: true});
        _.forEach(results, result => {
            let data = callback(result);
            batch.find({originId: data.originId, type: data.type}).upsert().updateOne({ $set: data });
        });

        if (batch.length != 0) {
            let result = yield batch.execute();
            console.log(`Inserted ${ batch.length } ${ this.type } feedsources.`);
        }
    }
};

ExportWatchList.prototype._getExportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_EXPORT));
};

ExportWatchList.prototype._getImportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_IMPORT));
};
