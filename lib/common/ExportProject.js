'use strict';

let _ = require('lodash');
let ConnectMongo = require('./ConnectMongo');
let utils = require('../common/utils');
let ObjectID = require('mongodb').ObjectID;
let co = require('co');
let mongo_config_pro = require('./Constant').mongo_config.pro;
let mongo_config_dev = require('./Constant').mongo_config.dev;

module.exports = function() {
    function ExportProject(_mongoConfig, _type, _criteria, _options) {
        this.mongoConfig = _mongoConfig || {};
        this.type = _type;
        this.criteria = _criteria || {};
        this.options = _options || {};
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
                let importDb = yield this._getImportDbPromise();

                yield queryProjects.apply(this, [feedSources, importDb]);

                console.log('> Exporting completed!');
                importDb && importDb.close();
            }

        }.bind(this)).catch(err => {
            console.log(err);
        });

        function* queryFeedSources() {
            let feedSourcesDb = yield this._getFeedSourcesDbPromise();
            let results = feedSourcesDb.collection(this.mongoConfig.feedSourcesCollection).find({type: this.type});
            let items = yield results.toArray();

            console.log(`query ${items.length} feed sources from ${this.mongoConfig.feedSourcesCollection}`);
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
                console.log(`No ${this.type} feedsources.`);
                return null;
            }
        }

        function* queryProjects(feedSources, importDb) {
            let exportDb = yield this._getExportDbPromise();

            let count = yield exportDb.collection(this.mongoConfig.exportCollection).count(this.criteria);
            console.log(`Query ${count} projects from ${this.mongoConfig.exportUrl}`);

            // init first query condition
            let minObjectId = new ObjectID(_.repeat('0', 24));
            let condition = utils.merge(this.criteria, {_id: {$gt: minObjectId}});

            let range = 10;
            let step = Math.floor(count / range) + 1;
            //let step = 1;
            for (let i = 0; i < step; i++) {
                let skip = range * i;
                let limit = range;

                let cursor = exportDb.collection(this.mongoConfig.exportCollection)
                    .find(condition, this.options).sort({_id: 1}).limit(limit);

                console.log(`Query projects from ${this.mongoConfig.exportUrl} limit: ${limit}, condition: ${JSON.stringify(condition)}`);

                let _results = yield cursor.toArray();
                if (_results.length > 0) {
                    // update the next query condition, get the last result's _id
                    let lastId = _results[_results.length - 1]._id;
                    condition = utils.merge(this.criteria, {_id: {$gt: lastId}});

                    // for each every item, execute callback function to handle result.
                    let items = [];
                    _.each(_results, result => {
                        if (!result) return;
                        let item = callback(result, feedSources);
                        if (item) items.push(item);
                    });

                    // insert project and project text
                    yield insertProjects.apply(this, [items, importDb]);
                    yield insertProjectTexts.apply(this, [items, importDb]);
                }
            }
            exportDb.close();
        }

        function* insertProjects(items, importDb) {
            let importCollection = importDb.collection(this.mongoConfig.importCollection);
            let importBatch = importCollection.initializeUnorderedBulkOp({useLegacyOps: true});
            _.each(items, item => {
                importBatch.find({id: item.id}).upsert().updateOne(item);
            });

            if (importBatch.length != 0) {
                let executeResult = yield importBatch.execute();
                console.log('> Inserted result: ' + JSON.stringify(executeResult));
                console.log(`> Inserted ${items.length} projects.`);
                console.log(JSON.stringify(items[0]));
            }
        }

        function* insertProjectTexts(items, importDb) {
            let projectCollection = importDb.collection('projects');
            let projectTextCollection = importDb.collection('projecttexts');
            let projectTextBatch = projectTextCollection.initializeUnorderedBulkOp({useLegacyOps: true});

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                let project = yield projectCollection.findOne({id: item.id}, {_id:1});
                let _id = project._id.toString();

                yield projectTextCollection.removeOne({_id: _id});
                projectTextBatch.insert({_id: _id, text: item.html_content})
            }

            if (projectTextBatch.length != 0) {
                let executeResult = yield projectTextBatch.execute();
                console.log('> Inserted result: ' + JSON.stringify(executeResult));
            }
        }
    };

    ExportProject.prototype._getFeedSourcesDbPromise = function() {
        return ConnectMongo(this.mongoConfig.feedSourcesUrl,
            this.mongoConfig.feedSourcesUsername,
            this.mongoConfig.feedSourcesPassword);
    };

    ExportProject.prototype._getExportDbPromise = function() {
        return ConnectMongo(this.mongoConfig.exportUrl,
            this.mongoConfig.exportUsername || mongo_config_pro.username,
            this.mongoConfig.exportPassword || mongo_config_pro.password);
    };

    ExportProject.prototype._getImportDbPromise = function() {
        return ConnectMongo(this.mongoConfig.importUrl,
            this.mongoConfig.importUsername,
            this.mongoConfig.importPassword);
    };

    return ExportProject;
};