'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let co = require('co');
let Constant = require('./execute/Constant');
let Elasticsearch = require('./elasticsearch/Elasticsearch');
let utils = require('./common/utils');
let config = require('config');
let ConnectMongo = require('./common/ConnectMongo');

exports.importProject =  importProject;
exports.importFeedSource = importFeedSource;

function importProject (options) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = _.assign(utils.criteria(hours), {type: type});

    co(function* () {
        let elasticsearch, db;
        try {
            elasticsearch = new Elasticsearch('boom', 'project', config.get(Constant.ES_IMPORT));
            db = yield ConnectMongo(config.get(Constant.ES_EXPORT));

            let collection = 'projects';
            let count = yield db.collection(collection).count(criteria);
            console.log(`Count ${count} ${type} projects.`);

            if (count != 0) {
                // init first query condition
                let condition = Object.assign({}, criteria);

                let step = Math.floor(count / range) + 1;
                let completed = 0;
                for (let i = 0; i < step; i++) {

                    let cursor = db.collection(collection).find(condition).sort({_id: 1}).limit(range);
                    let projects = yield cursor.toArray();

                    console.log(`Query ${projects.length} ${type} projects (completed=${range*i + projects.length}, count=${count}), condition: ${JSON.stringify(condition)}`);
                    if (projects.length == 0) continue;

                    // update the next query condition, get the last result's _id
                    let lastId = projects[projects.length - 1]._id;
                    condition = utils.mergeCriteria(condition, lastId);

                    let _ids = _.map(projects, project => {
                        return  project._id;
                    });

                    let projectTextCursor = db.collection('projecttexts').find({_id: {$in: _ids}});
                    let projectTexts = yield projectTextCursor.toArray() || [];

                    console.log(`Query ${projectTexts.length} ${type} projectTexts`);

                    var projectTextMap = projectTexts.reduce((map, obj) => {
                        map[obj._id] = obj.text;
                        return map;
                    }, {});

                    for (let j = 0; j < projects.length; j++) {
                        let project = projects[j];
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
                            datePublished: project.datePublished,
                            tags: project.tags,
                            text: getTextFromHtmlContent(projectTextMap[project._id.toString()]),
                            __v: project.__v
                        };
                        elasticsearch.batch(document);
                    }

                    if (elasticsearch.batchSize() != 0) {
                        completed += elasticsearch.batchSize();
                        console.log(`Add ${completed} ${type} projects to es.`);
                        yield elasticsearch.execute();
                    }
                }

                if (elasticsearch.batchSize() != 0)
                    yield elasticsearch.execute();
            }

        } catch(e) {
            console.log(e);
        }
        elasticsearch && elasticsearch.close();
        db && db.close();

    }.bind(this));

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
        let elasticsearch, db;
        try {
            elasticsearch = new Elasticsearch('boom', 'feedsource', config.get(Constant.ES_IMPORT));
            db = yield ConnectMongo(config.get(Constant.ES_EXPORT));

            let feedsourceCursor = db.collection('feedsources').find(criteria);
            let feedsources = yield feedsourceCursor.toArray();
            console.log(`Query ${type} ${feedsources.length} feedSources. condition: ${JSON.stringify(criteria)}`);

            for (let i = 0; i < feedsources.length; i++) {
                let feedsource = feedsources[i];
                let document = {
                    id: feedsource._id,
                    name: feedsource.name,
                    type: feedsource.type,
                    originId: feedsource.originId,
                    readers: feedsource.readers,
                    tags: feedsource.tags,
                    weight: feedsource.weight,
                    velocity: feedsource.velocity,
                    dateCreated: feedsource.dateCreated,
                    desc: feedsource.desc
                };

                elasticsearch.batch(document);
                console.log(`Add a ${ type } feedSource document to batch: ${JSON.stringify(document)}`);
            }

            if (elasticsearch.batchSize() != 0) {
                let result = yield elasticsearch.execute();
                console.log(`Add ${ feedsources.length } ${ type } feedSources to es successfully.`);
            }
        } catch(e) {
            console.log(e);
        }

        elasticsearch && elasticsearch.close();
        db && db.close();
    }.bind(this));
}
