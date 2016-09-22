'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Export = require('./Export');
let mongo_config = require('./../Config').mongo_config;

exports.exportWatchList = function(options) {
    let mongoConfig = Export.watchListMongoConfig('instagram_watchlist');
    Export.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = Export.projectMongoConfig('instagram');
    Export.exportProjects(options, mongoConfig, convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
        let originId = type + '/' + result.id;
        let data = {
            id: result.id,
            name: result.full_name,
            type: type,
            originId: originId,
            iconUrl: '',
            readers: 0,
            velocity: 0,
            dateCreated: new Date(),
            lastUpdated: new Date(),
            desc: result.biography,
            from: 'imported'
        };
        return data;
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        let feedSource = feedSources[(result.owner && result.owner.id) || ""];
        let feed = (feedSource && feedSource.toHexString()) || '';
        if (feed) {
            return {
                id: result.id,
                title: '',
                coverImg: {url: result.display_src},
                feed: feed,
                originUrl: '',
                type: type,
                dateCreated: new Date(),
                lastUpdated: new Date(),
                views: 0,
                likes: 0,
                tags: [],
                isDel: 0,
                desc: result.caption,

                from: 'imported'
            };
        } else {
            return null;
        }
    }
}

