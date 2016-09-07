'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let co = require('co');
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let Elasticsearch = require('./elasticsearch/Elasticsearch')();
let esConfig = require('./common/Constant').es_config;
let utils = require('./common/utils');
let ObjectID = require('mongodb').ObjectID;

let es_config = {
    host: `${esConfig.dev.host}:${esConfig.dev.port}`,
    log: 'info'
};

let mongo_url = `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`;
let username = mongo_config_dev.username;
let password = mongo_config_dev.password;

module.exports = {
    importProject: importProject,
    importFeedSource: importFeedSource
};

function importProject () {
    co(function* () {
        let elasticsearch = new Elasticsearch('boom', 'project', es_config);
        let db = yield ConnectMongo(mongo_url, username, password);
        let collection = 'projects';

        let count = yield db.collection(collection).count({});
        console.log(`Query ${count} projects from ${mongo_url}`);

        // init first query condition
        let minObjectId = new ObjectID(_.repeat('0', 24));
        let condition = {_id: {$gt: minObjectId}};

        let range = 100;
        let step = Math.floor(count / range) + 1;
        //let step = 1;
        for (let i = 0; i < step; i++) {
            let skip = range * i;
            let limit = range;

            let cursor = db.collection(collection).find(condition).sort({_id: 1}).limit(limit);
            console.log(`Query projects from ${mongo_url} (${skip}, ${count}), condition: ${JSON.stringify(condition)}`);

            let projects = yield cursor.toArray();
            let _ids = _.map(projects, project => {
                return  project._id.toString();
            });

            let projectTextCursor = db.collection('projecttexts').find({_id: {$in: _ids}});
            let projectTexts = yield projectTextCursor.toArray();
            console.log(`Query project texts from ${mongo_url} `);

            var projectTextMap = projectTexts.reduce((map, obj) => {
                map[obj._id] = obj.text;
                return map;
            }, {});

            // update the next query condition, get the last result's _id
            let lastId = projects[projects.length - 1]._id;
            condition = {_id: {$gt: lastId}};

            for (let i = 0; i < projects.length; i++) {
                let project = projects[i];
                let document = {
                    id: project._id,
                    desc: project.desc,
                    title: project.title,
                    type: project.type,
                    channel: project.channel,
                    isDel: project.isDel,
                    likes: project.likes,
                    views: project.views,
                    lastUpdated: project.lastUpdated,
                    dateCreated: project.dateCreated,
                    tags: project.tags,
                    text: getTextFromHtmlContent(projectTextMap[project._id.toString()]),
                    __v: project.__v
                };

                elasticsearch.batch(document);
                console.log(`Add a document to batch: ${JSON.stringify(document)}`);
            }

            let result = yield elasticsearch.execute();
            console.log('import to es. ' + JSON.stringify(result));
        }
        db.close();

    }.bind(this)).catch(err => {
        console.log(err);
    });

    function getTextFromHtmlContent(htmlContent) {
        if (!htmlContent) return '';

        let $ = cheerio.load(htmlContent);
        return $.text();
    }
}

function importFeedSource() {
    co(function* () {
        let elasticsearch = new Elasticsearch('boom', 'feedsource', es_config);

        let db = yield ConnectMongo(mongo_url, username, password);
        let feedsourceCursor = db.collection('feedsources').find({});
        let feedsources = yield feedsourceCursor.toArray();

        console.log(`query ${feedsources.length} feedsources from ${mongo_url}`);
        db.close();

        for (let i = 0; i < feedsources.length; i++) {
            let feedsource = feedsources[i];
            elasticsearch.batch({
                id: feedsource._id,
                name: feedsource.name,
                type: feedsource.type,
                originId: feedsource.originId,
                readers: feedsource.readers,
                velocity: feedsource.velocity,
                dateCreated: feedsource.dateCreated,
                desc: feedsource.desc
            });
        }

        let result = yield elasticsearch.execute();
        console.log('import to es done. ' + JSON.stringify(result));

    }.bind(this)).catch(err => {
        console.log(err);
    });
}
