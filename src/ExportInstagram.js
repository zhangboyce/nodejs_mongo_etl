'use strict';

let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    ExportWatchList.exportWatchList(options, 'instagram_watchlist', convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    ExportProject.exportProjects(options, 'instagram', convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
        let originId = type + '/' + result.id;
        let data = {
            _id: result._id,
            id: result.id,
            name: result.full_name,
            type: type,
            originId: originId,
            iconUrl: '',
            velocity: 0,
            dateImported: new Date(),
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

            let tags = utils.extractTags(result.caption);
            return {
                id: result.id,
                title: '',
                coverImg: {url: result.display_src},
                feed: feed,
                originUrl: '',
                type: type,
                dateImported: new Date(),
                datePublished: new Date(),
                tags: tags,
                isDel: 0,
                desc: result.caption,

                from: 'imported'
            };
        } else {
            return null;
        }
    }
}

