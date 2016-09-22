'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Export = require('./Export');
let mongo_config = require('./../Config').mongo_config;

exports.exportWatchList = function(options) {
    let mongoConfig = Export.watchListMongoConfig('facebook_watchlist');
    Export.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = Export.projectMongoConfig('facebook');
    Export.exportProjects(options, mongoConfig, convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
        let originId = type + '/' + result.id;
        let data = {
            id: result.id,
            name: result.name,
            type: type,
            originId: originId,
            iconUrl: result.cover && result.cover.source,
            readers: 0,
            velocity: 0,
            dateCreated: new Date(),
            lastUpdated: new Date(),
            desc: result.about,
            from: 'imported'
        };
        return data;
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        let feed = feedSources[result.from.id].toHexString();
        if (feed) {
            return {
                id: result.id,
                title: result.name,
                coverImg: {url: result.picture},
                feed: feed,
                originUrl: result.link,
                type: type,
                dateCreated: new Date(),
                lastUpdated: new Date(),
                tags: [],
                isDel: 0,
                desc: result.message,
                from: 'imported'
            };
        } else {
            return null;
        }
    }
}
