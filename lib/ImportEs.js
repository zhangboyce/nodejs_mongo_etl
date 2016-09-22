'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let co = require('co');
let ConnectMongo = require('./common/ConnectMongo');
let es_etl_config = require('./../Config').es_etl_config;
let Elasticsearch = require('./elasticsearch/Elasticsearch');
let utils = require('./common/utils');

exports.importProject =  importProject;
exports.importFeedSource = importFeedSource;

function importProject (options) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = _.assign(utils.criteria(hours), {type: type});

    co(function* () {
        let elasticsearch = new Elasticsearch('boom', 'project', es_etl_config.es);
        let db = yield ConnectMongo(es_etl_config.mongo.url);
        let collection = 'projects';

        let count = yield db.collection(collection).count(criteria);

        console.log(`Count ${count} ${type} projects.`);
        if (count == 0) {
            db.close();
            elasticsearch.close();
            return
        }

        // init first query condition
        let condition = utils.mergeCriteria(criteria)

        let step = Math.floor(count / range) + 1;
        for (let i = 0; i < step; i++) {
            let limit = range;

            let cursor = db.collection(collection).find(condition).sort({_id: 1}).limit(limit);
            let projects = yield cursor.toArray();

            console.log(`Query ${projects.length} ${type} projects (completed=${range*i + projects.length}, count=${count}), condition: ${JSON.stringify(condition)}`);
            if (projects.length == 0) continue;

            // update the next query condition, get the last result's _id
            let lastId = projects[projects.length - 1]._id;
            condition = utils.mergeCriteria(condition, lastId);

            let _ids = _.map(projects, project => {
                return  project._id.toString();
            });

            let projectTextCursor = db.collection('projecttexts').find({_id: {$in: _ids}});
            let projectTexts = yield projectTextCursor.toArray();

            console.log(`Query ${projectTexts.length} ${type} project-texts`);
            if (projectTexts.length == 0) continue;

            var projectTextMap = projectTexts.reduce((map, obj) => {
                map[obj._id] = obj.text;
                return map;
            }, {});

            for (let i = 0; i < projects.length; i++) {
                let project = projects[i];
                let document = {
                    id: project._id,
                    desc: project.desc,
                    title: project.title,
                    feed: project.feed,
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
                if (i%range == 0) console.log(`Add a document to batch: ${JSON.stringify(document)}`);
            }

            let result = yield elasticsearch.execute();
        }

        db.close();
        elasticsearch.close();

    }.bind(this)).catch(err => {
        console.log(err);
    });

    function getTextFromHtmlContent(htmlContent) {
        if (!htmlContent) return '';

        let $ = cheerio.load(htmlContent);
        return $.text();
    }
}

function importFeedSource(options) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = _.assign(utils.criteria(hours), {type: type});

    co(function* () {
        let elasticsearch = new Elasticsearch('boom', 'feedsource', es_etl_config.es);

        let db = yield ConnectMongo(es_etl_config.mongo.url);
        let feedsourceCursor = db.collection('feedsources').find(criteria);
        let feedsources = yield feedsourceCursor.toArray();

        console.log(`Query ${type} ${feedsources.length} feed-sources. condition: ${JSON.stringify(criteria)}`);
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
        elasticsearch.close();

    }.bind(this)).catch(err => {
        console.log(err);
    });
}
