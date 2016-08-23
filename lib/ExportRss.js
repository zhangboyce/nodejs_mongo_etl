'use strict';

let Promise = require('bluebird');
let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./ConnectMongo');
let mongo_config = require('./Constant').mongo_config;

module.exports = function() {
    let online = mongo_config.online;
    let dev =mongo_config.dev;

    let username = online.username;
    let password = online.password;
    let rssRrl = `mongodb://${online.host}:${online.port}/contentpool`;
    let rssCollection = "rss";

    let feedSourcesUrl = `mongodb://${dev.host}:${dev.port}/boom`;
    let feedSourcesCollection = "feedsources";

    ConnectMongo(feedSourcesUrl)
        .then(queryAllFeedSources)
        .then(queryRssByFeedSources)
        .then(insertProjects)
        .catch(err => {
            logger.error(err);
        });

    // Query all feed sources
    function queryAllFeedSources(db) {
        return new Promise((resolve, reject) => {
            db.collection(feedSourcesCollection).find({type: 'feed'}, (err, results) => {
                if (err) reject(err);

                results.toArray((err, items) => {
                    let feedSources = {}
                    for (let i=0; i< items.length; i++) {
                        let result = items[i];
                        let originId = result.originId;
                        feedSources[originId.replace('feed/','')] = result._id;
                    }

                    logger.debug(`query ${items.length} feed sources from ${feedSourcesUrl}`);
                    resolve(feedSources);

                    db.close();
                });
            });
        });
    }

    // Query Rss project by feed sources
    function queryRssByFeedSources(feedSources) {
        return new Promise((resolve, reject) => {
            ConnectMongo(rssRrl, username, password).then(db => {

                let cursor = db.collection(rssCollection).find({});
                cursor.toArray((err, items) => {
                    if (err) reject(err);

                    let results = [];
                    for (let i=0; i< items.length; i++) {
                        let result = items[i];

                        let keywords = result.bosonnlp && result.bosonnlp.keywords;
                        let tags = _.slice(_.map(keywords, keyword => {return keyword[1]}), 0, 10);
                        let feed = feedSources[result.feed].toHexString();

                        if (feed) {
                            results.push({
                                title: result.title,
                                originUrl: result.url,
                                type: 'feed',
                                feed: feed,
                                isDel: 0,
                                views: 0,
                                likes: 0,
                                desc: '',
                                website: result.website,
                                text_content: result.text_content,
                                dateCreated: new Date(),
                                lastUpdated: new Date(),
                                tags: tags,
                                from: 'imported'
                            });
                        }
                    }
                    logger.debug(`query ${results.length} rss projects from ${rssRrl}`);
                    resolve(results);

                    db.close();
                });
            }).catch(err => {
                logger.error(err);
            });
        });
    }

    // Insert rss to projects
    function insertProjects(results) {
        ConnectMongo(feedSourcesUrl).then(db => {
            _.forEach(results, result => {

                db.collection('projects').updateOne({feed: result.feed, originUrl: result.originUrl,
                    type: result.type}, result, {upsert: true});

                logger.debug('upsert a project: %s', JSON.stringify(result));
            });

            db.close();
        }).catch(err => {
            logger.error(err);
        });
    }
};
