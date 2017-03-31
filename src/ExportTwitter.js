'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    let mongoConfig = ExportWatchList.watchListMongoConfig('twitter_watchlist');
    ExportWatchList.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = ExportProject.projectMongoConfig('twitter');
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
            iconUrl: result.profile_image_url,
            velocity: 0,
            dateImported: new Date(),
            desc: result.description,
            from: 'imported'
        };
        return data;
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        let feed = feedSources[result.user.id].toHexString();
        if (feed) {

            let tags = utils.extractTags(result.text);

            return {
                id: result.id.toString(),
                title: result.name,
                coverImg: {url: ''},
                feed: feed,
                originUrl: '',
                type: type,
                dateImported: new Date(),
                datePublished: new Date(),
                views: 0,
                likes: 0,
                tags: tags,
                isDel: 0,
                desc: result.text,
                from: 'imported'
            };
        } else {
            return null;
        }
    }
}
