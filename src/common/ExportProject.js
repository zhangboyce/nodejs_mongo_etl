'use strict';

let _ = require('lodash');
let utils = require('./utils');
let co = require('co');
let Context = require('./Context');
let Constant = require('../execute/Constant');

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

ExportProject.projectMongoConfig = function(exportCollection) {
    return {
        exportDb: Constant.MONGO_EXPORT_RAW,
        exportCollection: exportCollection,

        importDb: Constant.MONGO_IMPORT,
        importCollection: 'projects',

        feedSourcesDb: Constant.MONGO_IMPORT,
        feedSourcesCollection: 'feedsources'
    };
};

ExportProject.exportProjects = function(options, mongoConfig, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {  };

    let exportProject = new ExportProject(mongoConfig, criteria, fields, type, range);
    exportProject.execute(convertorFtn(type));
};

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

        let count = 0;
        let start = Date.now();

        let feedSources = yield queryFeedSources.call(this);
        if (feedSources) {
            this.importDb = yield this._getImportDbPromise();
            this.feedsources = feedSources;

            count = yield exportProjects.call(this);
        }
        console.log(`> Export ${ count } ${ this.type } projects completed, and take: ${ (Date.now() - start)/1000 } s.`);

    }.bind(this)).catch(err => {
        console.log(err);
    });

    function* queryFeedSources() {
        let collection = this.mongoConfig.feedSourcesCollection;
        let feedSourcesDb = yield this._getFeedSourcesDbPromise();
        let results = feedSourcesDb.collection(collection).find({type: this.type});

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
        let exportDb = yield this._getExportDbPromise();

        let start = Date.now();
        let collection = this.mongoConfig.exportCollection;
        let count = yield exportDb.collection(collection).count(this.criteria);

        console.log(`Count ${count} ${this.type} projects, and take: ${ (Date.now() - start)/1000 } s.`);

        if (count > 0) {
            // init first query condition
            let condition = utils.mergeCriteria(this.criteria);
            let step = Math.floor(count / this.range) + 1;
            for (let i = 0; i < step; i++) {
                condition = yield _step.apply(this, [exportDb, condition, count, i]);
            }
        }
        return count;
    }

    function* _step(exportDb, condition, count, i) {

        let start = Date.now();
        let collection = this.mongoConfig.exportCollection;
        let cursor = exportDb.collection(collection).find(condition, this.fields).sort({_id: 1}).limit(this.range);
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

            // insert project and project text
            yield insertProjects.call(this, items);
            if ([
                    Constant.TYPE_WECHAT,
                    Constant.TYPE_WEBSITE,
                    Constant.TYPE_FEED].indexOf(this.type) != -1) {

                yield insertProjectTexts.call(this, items);
            }

            // update the next query condition, get the last result's _id
            condition =  utils.mergeCriteria(this.criteria, _results[_results.length - 1]._id);
        }
        console.log(`Export ${this.type} projects (completed=${this.range*i + _results.length}, count=${count}), condition: ${JSON.stringify(condition)}, and take: ${ (Date.now() - start)/1000 } s.`);

        return condition;
    }

    function* insertProjects(items) {
        let importCollection = this.importDb.collection(this.mongoConfig.importCollection);
        let importBatch = importCollection.initializeUnorderedBulkOp({useLegacyOps: true});
        _.each(items, item => {
            let _item = _.assign({}, item);
            delete _item.html_content;
            importBatch.find({id: item.id}).upsert().updateOne({ $set: _item });

            console.log(`Add a ${ this.type } project: ${ JSON.stringify(_item, null, 0) }.`);
        });

        if (importBatch.length != 0) {
            let result = yield importBatch.execute();
            console.log(`Inserted ${ importBatch.length } ${ this.type } projects.`);
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

            let project_text = { _id: _id, text: item.html_content };
            projectTextBatch.insert(project_text);

            console.log(`Add a ${ this.type } projecttext: ${ JSON.stringify(project_text, null, 0) }.`);
        }

        if (projectTextBatch.length != 0) {
            let result = yield projectTextBatch.execute();
            console.log(`Inserted ${ projectTextBatch.length } ${ this.type } projecttexts.`);
        }
    }
};

ExportProject.prototype._getFeedSourcesDbPromise = function() {
    return Context.get(this.mongoConfig.feedSourcesDb);
};

ExportProject.prototype._getExportDbPromise = function() {
    return Context.get(this.mongoConfig.exportDb);
};

ExportProject.prototype._getImportDbPromise = function() {
    return Context.get(this.mongoConfig.importDb);
};
