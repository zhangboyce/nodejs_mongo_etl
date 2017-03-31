'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    let mongoConfig = ExportWatchList.watchListMongoConfig('facebook_watchlist');
    ExportWatchList.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = ExportProject.projectMongoConfig('facebook');
    ExportProject.exportProjects(options, mongoConfig, convert2Project)
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
            dateImported: new Date(),
            desc: result.about,
            from: 'imported'
        };
        return data;
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        if (!result) return null;

        let feed = feedSources[result.from.id].toHexString();
        if (feed) {
            let tags = utils.extractTags(result.message);
            return {
                id: result.id,
                title: result.name,
                coverImg: {url: result.picture},
                feed: feed,
                originUrl: result.link,
                type: type,
                dateImported: new Date(),
                datePublished: new Date(),
                tags: tags,
                isDel: 0,
                desc: result.message,
                from: 'imported'
            };
        } else {
            return null;
        }
    }
}