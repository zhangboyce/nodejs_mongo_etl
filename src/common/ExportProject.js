'use strict';

let _ = require('lodash');
let utils = require('./utils');
let co = require('co');
let config = require('config');
let ConnectMongo = require('./ConnectMongo');
let Constant = require('../execute/Constant');

module.exports = ExportProject;

function ExportProject(exportCollection, criteria, fields, type, range) {
    this.exportCollection = exportCollection;
    this.criteria = criteria || {};
    this.fields = fields || {};
    this.type = type;
    this.range = range;
}

ExportProject.exportProjects = function(options, exportCollection, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {  };

    let exportProject = new ExportProject(exportCollection, criteria, fields, type, range);
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
        let collection = this.exportCollection;
        let count = yield this.exportDb.collection(collection).count(this.criteria);

        console.log(`Count ${count} ${this.type} projects, and take: ${ (Date.now() - start)/1000 } s.`);

        if (count > 0) {
            // init first query condition
            let condition = utils.mergeCriteria(this.criteria);
            let step = Math.floor(count / this.range) + 1;
            for (let i = 0; i < step; i++) {
                condition = yield _step.apply(this, [condition, count, i]);
            }
        }
        return count;
    }

    function* _step(condition, count, i) {

        let start = Date.now();
        let collection = this.exportCollection;
        let cursor = this.exportDb.collection(collection).find(condition, this.fields).sort({_id: 1}).limit(this.range);
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

            yield insertProjects.call(this, items);

            // update the next query condition, get the last result's _id
            condition =  utils.mergeCriteria(this.criteria, _results[_results.length - 1]._id);
        }
        console.log(`Export ${this.type} projects (completed=${this.range*i + _results.length}, count=${count}), condition: ${JSON.stringify(condition)}, and take: ${ (Date.now() - start)/1000 } s.`);

        return condition;
    }

    function* insertProjects(items) {
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
            let result = yield importBatch.execute();
            console.log(`Inserted ${ importBatch.length } ${ this.type } projects.`);
        }

        if (projectTextBatch.length != 0) {
            let result = yield projectTextBatch.execute();
            console.log(`Inserted ${ projectTextBatch.length } ${ this.type } projecttexts.`);
        }
    }
};

ExportProject.prototype._getExportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_EXPORT));
};

ExportProject.prototype._getImportDbPromise = function() {
    return ConnectMongo(config.get(Constant.MONGO_IMPORT));
};
