'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    ExportWatchList.exportWatchList(options, 'facebook_watchlist', convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    ExportProject.exportProjects(options, 'facebook', convert2Project)
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
                _id: result._id,
                id: result.id,
                title: result.name,
                coverImg: {url: result.picture},
                feed: feed,
                originUrl: result.link,
                type: type,
                dateImported: new Date(),
                datePublished: result.created_time?new Date(result.created_time):result.crawl_time,
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
