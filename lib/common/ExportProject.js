'use strict';

let _ = require('lodash');
let ConnectMongo = require('./ConnectMongo');
let utils = require('../common/utils');
let co = require('co');

module.exports = ExportProject;

function ExportProject(mongoConfig, criteria, fields, type, range) {
    this.mongoConfig = mongoConfig || {};
    this.criteria = criteria || {};
    this.fields = fields || {};
    this.type = type;
    this.range = range;

    this.feedsources = [];
    this.importDb = null;
}

/**
 *
 * @param callback
 */
ExportProject.prototype.execute = function(callback) {

    co(function* () {
        if (!callback || typeof callback != 'function') {
            console.log('.execute() only accept a function but was passed: ' + {}.toString.call(callback));
            return null;
        }

        let feedSources = yield queryFeedSources.call(this);
        if (feedSources) {
            this.importDb = yield this._getImportDbPromise();
            this.feedsources = feedSources;

            yield queryProjects.call(this);

            console.log('> Exporting completed!');
            this.importDb && this.importDb.close();
        }

    }.bind(this)).catch(err => {
        console.log(err);
    });

    function* queryFeedSources() {
        let collection = this.mongoConfig.feedSourcesCollection;

        let feedSourcesDb = yield this._getFeedSourcesDbPromise();
        let results = feedSourcesDb.collection(collection).find({type: this.type});
        let items = yield results.toArray();

        console.log(`Query ${items.length} ${this.type} feed-sources.`);
        feedSourcesDb.close();

        if (items.length != 0) {
            let feedSources = {};
            for (let i = 0; i < items.length; i++) {
                let result = items[i];
                let originId = result.originId;
                feedSources[originId.replace(this.type + '/', '')] = result._id;
            }
            return feedSources;

        } else {
            console.log(`No ${this.type} feed-sources.`);
            return null;
        }
    }

    function* queryProjects() {
        let exportDb = yield this._getExportDbPromise();

        let collection = this.mongoConfig.exportCollection;
        let count = yield exportDb.collection(collection).count(this.criteria);
        console.log(`Query ${count} ${this.type} projects.`);
        if (count > 0) {
            // init first query condition
            let condition = utils.mergeCriteria(this.criteria);
            let step = Math.floor(count / this.range) + 1;
            for (let i = 0; i < step; i++) {
                condition = yield _step.apply(this, [exportDb, condition, count, i]);
            }
        }
        exportDb.close();
    }

    function* _step(exportDb, condition, count, i) {
        let collection = this.mongoConfig.exportCollection;
        let cursor = exportDb.collection(collection).find(condition, this.fields).sort({_id: 1}).limit(this.range);
        let _results = yield cursor.toArray();

        console.log(`Query ${this.type} projects (completed=${this.range*i + _results.length}, count=${count}), condition: ${JSON.stringify(condition)}`);

        if (_results.length > 0) {
            // for each every item, execute callback function to handle result.
            let items = [];
            let feedSources = this.feedsources;
            _.each(_results, result => {
                if (!result) return;
                let item = callback(result, feedSources);
                if (item) items.push(item);
            });

            // insert project and project text
            yield insertProjects.call(this, items);
            yield insertProjectTexts.call(this, items);

            // update the next query condition, get the last result's _id
            condition =  utils.mergeCriteria(this.criteria, _results[_results.length - 1]._id);
        }

        return condition;
    }

    function* insertProjects(items) {
        let importCollection = this.importDb.collection(this.mongoConfig.importCollection);
        let importBatch = importCollection.initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(items, item => {
            let _item = _.assign({}, item);
            delete _item.html_content;
            //delete _item._id;
            importBatch.find({id: item.id}).upsert().updateOne(_item);
        });

        if (importBatch.length != 0) {
            yield importBatch.execute();
            console.log(`> Inserted ${items.length} ${this.type} projects. ${items[0]}`);
        }
    }

    function* insertProjectTexts(items) {
        let projectCollection = this.importDb.collection('projects');
        let projectTextCollection = this.importDb.collection('projecttexts');
        let projectTextBatch = projectTextCollection.initializeUnorderedBulkOp({useLegacyOps: true});

        for (let i = 0; i < items.length; i++) {
            let item = items[i];

            let project = yield projectCollection.findOne({id: item.id}, {_id:1});
            let _id = project._id.toString();

            yield projectTextCollection.removeOne({_id: _id});
            projectTextBatch.insert({_id: _id, text: item.html_content})
        }

        if (projectTextBatch.length != 0) {
            yield projectTextBatch.execute();
        }
    }
};

ExportProject.prototype._getFeedSourcesDbPromise = function() {
    return ConnectMongo(this.mongoConfig.feedSourcesUrl);
};

ExportProject.prototype._getExportDbPromise = function() {
    return ConnectMongo(this.mongoConfig.exportUrl);
};

ExportProject.prototype._getImportDbPromise = function() {
    return ConnectMongo(this.mongoConfig.importUrl);
};
