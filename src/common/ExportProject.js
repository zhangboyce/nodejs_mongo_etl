'use strict';

let _ = require('lodash');
let utils = require('./utils');
let co = require('co');
let config = require('config');
let ConnectMongo = require('./ConnectMongo');
let ObjectID = require('mongodb').ObjectID;
let Constant = require('../execute/Constant');

module.exports = ExportProject;

function ExportProject(exportCollection, hours, type, range) {
    this.exportCollection = exportCollection;
    this.hours = hours;
    this.type = type;
    this.range = range;
    this.criteria = utils.criteria(hours);
}

ExportProject.exportProjects = function(options, exportCollection, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let exportProject = new ExportProject(exportCollection, hours, type, range);
    exportProject.execute(convertorFtn(type));
};

/**
 *
 * @param callback
 */
ExportProject.prototype.execute = function(callback) {

    if (!callback || typeof callback != 'function') {
        console.log('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
        return null;
    }

    co(function* () {
        let count = 0;
        let start = Date.now();

        try {
            this.importDb = yield this._getImportDbPromise();
            this.exportDb = yield this._getExportDbPromise();

            let feedSources = yield queryFeedSources.call(this);
            if (feedSources) {
                this.feedsources = feedSources;
                count = yield exportProjects.call(this);
            }
            console.log(`> Export ${ count } ${ this.type } projects completed, and take: ${ (Date.now() - start)/1000 } s.`);

        } catch(e) {
            console.log(e);
        }

        this.importDb.close();
        this.exportDb.close();

    }.bind(this));

    function* queryFeedSources() {
        let results = this.importDb.collection('feedsources').find({type: this.type});

        let items = yield results.toArray();
        let feedSources = {};
        let start = Date.now();

        for (let i = 0; i < items.length; i++) {
            let result = items[i];
            let originId = result.originId;
            feedSources[originId.replace(this.type + '/', '')] = result._id;
        }
        console.log(`Query ${ items.length } ${this.type} feedSources, and take: ${ (Date.now() - start) / 1000 } s.`);

        return feedSources;
    }

    function* exportProjects() {
        let start = Date.now();
        let count = yield this.exportDb.collection(this.exportCollection).count(this.criteria);

        console.log(`Count ${count} ${this.type} projects, and take: ${ (Date.now() - start)/1000 } s.`);

        if (count > 0) {
            // init first query condition
            let condition = Object.assign({}, this.criteria);

            let exportedCount = 0;
            if (this.hours == 0) {
                exportedCount = yield this.importDb.collection('projects').count({type: this.type});
                console.log(`Had exported ${ exportedCount }, start with the ${ exportedCount }th.`);

                if (exportedCount != 0) {
                    let exported = yield this.importDb.collection('projects').find({ type: this.type }, {_id: 1}).sort({_id: -1}).limit(1).toArray();
                    condition = { _id: { '$gt': exported[0]._id } }
                }
            }

            let cache = {count: 0};
            while (true) {
                start = Date.now();

                let completed = yield step.apply(this, [condition, cache]);
                if (completed == 0) break;

                console.log(`Export ${this.type} projects (completed=${ exportedCount += completed }, count=${count}), condition: ${JSON.stringify(condition)}, and take: ${ (Date.now() - start)/1000 } s.`);
            }

            while (yield new Promise((rs, rj) => {
                setTimeout(() => { cache.count == 0? rs(false): rs(true); }, 100)
            })){}
        }
        return count;
    }

    function* step(condition, cache) {

        let cursor = this.exportDb.collection(this.exportCollection).find(condition).sort({_id: 1}).limit(this.range);
        let _results = yield cursor.toArray();

        if (_results.length > 0) {
            // for each every item, execute callback function to handle result.
            let items = [];
            let feedSources = this.feedsources;
            _.each(_results, result => {
                if (!result) return;
                let item = callback(result, feedSources);
                if (item) items.push(item);
            });

            while (yield new Promise((rs, rj) => {
                setTimeout(() => { cache.count > 6 ? rs(true): rs(false); }, 50);
            })){}

            cache.count += 2;

            insertProjects.apply(this, [items, cache]);

            // update the next query condition, get the last result's _id
            let objectId = _results[_results.length - 1]._id;
            Object.assign(condition, { _id: Object.assign({}, condition._id || {}, { '$gt': objectId }) });
        }

        return _results.length;
    }

    function insertProjects(items, cache) {
        let importBatch = this.importDb.collection('projects').initializeUnorderedBulkOp({useLegacyOps: true});
        let projectTextBatch = this.importDb.collection('projecttexts').initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(items, item => {

            let html_content = item.html_content;
            if (html_content && html_content.trim() != '') {
                projectTextBatch.find({ _id: item._id }).upsert().updateOne({ $set: { _id: item._id, text: html_content} });
            }

            delete item.html_content;
            importBatch.find({ _id: item._id }).upsert().updateOne({ $set: item });

        });
        if (importBatch.length != 0) {
            importBatch.execute((err, result) => {
                cache.count -= 1;
                if(err) {
                    console.log(err);
                    return;
                }
                console.log(`Inserted ${ importBatch.length } ${ this.type } projects.`);
            });
        }else {
            cache.count -= 1;
        }

        if (projectTextBatch.length != 0) {
            projectTextBatch.execute((err, result) => {
                cache.count -= 1;
                if(err) {
                    console.log(err);
                    return;
                }
                console.log(`Inserted ${ projectTextBatch.length } ${ this.type } projecttexts.`);
            });
        }else {
            cache.count -= 1;
        }
    }
};

ExportProject.prototype._getExportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_EXPORT));
};

ExportProject.prototype._getImportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_IMPORT));
};
