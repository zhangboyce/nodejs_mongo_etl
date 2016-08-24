'use strict';

//let Promise = require('bluebird');
let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./ConnectMongo');
let mongo_config = require('./Constant').mongo_config;

module.exports = {
    exportWeixinWatchList: exportWeixinWatchList ,
    exportWeixinProjects: exportWeixinProjects
};

function exportWeixinProjects() {
    let online = mongo_config.online;
    let dev =mongo_config.dev;

    let username = online.username;
    let password = online.password;

    let weixinRrl = `mongodb://${online.host}:${online.port}/contentpool`;
    let weixinCollection = "weixin";

    let feedSourcesUrl = `mongodb://${dev.host}:${dev.port}/boom`;
    let feedSourcesCollection = "feedsources";

    let start = Date.now();
    ConnectMongo(feedSourcesUrl)
        .then(queryAllFeedSources)
        .then(queryWeixinByFeedSources)
        .catch(err => {
            logger.error(err);
        });

    // Query all feed sources
    function queryAllFeedSources(db) {
        return new Promise((resolve, reject) => {
            db.collection(feedSourcesCollection).find({type: 'wechat'}, (err, results) => {
                if (err) reject(err);

                results.toArray((err, items) => {
                    let feedSources = {}
                    for (let i=0; i< items.length; i++) {
                        let result = items[i];
                        let originId = result.originId;
                        feedSources[originId.replace('wechat/','')] = result._id;
                    }

                    logger.debug(`query ${items.length} feed sources from ${feedSourcesUrl}`);
                    resolve(feedSources);

                    db.close();
                });
            });
        });
    }

    function queryWeixinByFeedSources(feedSources) {
        ConnectMongo(weixinRrl, username, password).then(weixinDb => {
            return new Promise((resolve, reject) => {
                weixinDb.collection(weixinCollection).count({}, (err, count) => {
                    if (err) reject(err);
                    resolve(count);
                });

            }).then(count => {
                logger.info(`Query ${count} weixin project from ${weixinRrl}`);
                if (!count) return null;

                let num = 0;
                let range = 10;
                let step = Math.floor(count/range) + 1;
                for (let i = 0; i<step; i++) {
                    let skip = range * i;
                    let limit = range;

                    let cursor = weixinDb.collection(weixinCollection).find({}, {},{skip: skip, limit: limit});

                    Promise.resolve(cursor).then(cursor => {
                        logger.info(`Query weixin project skip: ${skip}, limit: ${limit}`);

                        return new Promise((resolve, reject) => {
                            cursor.toArray((err, results) => {
                                if (err) reject(err);

                                let items = [];
                                for (let i=0; i<results.length; i++) {
                                    let result = results[i];
                                    if (!result) return;

                                    let keywords = result.bosonnlp && result.bosonnlp.keywords;
                                    let tags = _.slice(_.map(keywords, keyword => {return keyword[1]}), 0, 10);
                                    let feed = feedSources[result.biz].toHexString();

                                    if (feed) {
                                        items.push({
                                            title: result.title,
                                            originUrl: result.url,
                                            type: 'wechart',
                                            feed: feed,
                                            isDel: 0,
                                            views: 0,
                                            likes: 0,
                                            desc: '',
                                            weixin_id: result.id,
                                            text_content: result.text_content,
                                            dateCreated: new Date(),
                                            lastUpdated: new Date(),
                                            tags: tags,
                                            from: 'imported_2'
                                        });
                                    }
                                }
                                resolve(items);
                            });
                        })
                    }).then(items => {
                        ConnectMongo(feedSourcesUrl).then(projectDb => {
                            let batch = projectDb.collection('projects').initializeUnorderedBulkOp({useLegacyOps: true});

                            console.log(`Inserted ${num += items.length} projects.`);
                            console.log(JSON.stringify(items[0]));

                            _.each(items, result => {
                                batch.find({feed: result.feed, originUrl: result.originUrl,type: result.type})
                                    .upsert().updateOne(result);
                            });
                            batch.execute((err, result) => {
                                projectDb.close();
                            });
                        });
                    });
                }
            });
        });
    }
}

function exportWeixinWatchList() {
    let online = mongo_config.online;
    let dev =mongo_config.dev;

    let username = online.username;
    let password = online.password;

    let weixinWatchListRrl = `mongodb://${online.host}:${online.port}/raw`;
    let weixinWatchListCollection = "weixin_watchlist";

    let feedSourcesUrl = `mongodb://${dev.host}:${dev.port}/boom`;
    let feedSourcesCollection = "feedsources";

    ConnectMongo(weixinWatchListRrl, username, password)
        .then(queryAllWeixinWatchList)
        .then(insertWeixinWatchList)
        .catch(err => {
            logger.err(err);
        });

    function queryAllWeixinWatchList(db) {
        return new Promise((resolve, reject) => {
            db.collection(weixinWatchListCollection).find({}, (err, results) => {
                if (err) reject(err);
                results.toArray((err, items) => {
                    logger.debug(`query ${items.length} weixin watch list from ${weixinWatchListRrl}`);
                    resolve(items);
                    db.close();
                });
            });
        });
    }

    function insertWeixinWatchList(results) {
        ConnectMongo(feedSourcesUrl).then(db => {
            _.forEach(results, result => {
                let originId = 'wechat/' + result.biz;
                let type = 'wechat';

                let data = {
                    originId: originId,
                    type: type,
                    name: result.biz_name,
                    readers: 0,
                    velocity: 0,
                    dateCreated: new Date(),
                    wechat_id: result.wechat_id,
                    copyright: result.copyright,
                    avatar: result.avatar,
                    desc: result.description
                };

                db.collection(feedSourcesCollection).updateOne({originId: originId, type: type}, data, {upsert: true});

                logger.debug('upsert a feedSources: %s', JSON.stringify(data));
            });

            db.close();
        }).catch(err => {
            logger.error(err);
        });
    }
}
