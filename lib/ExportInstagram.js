'use strict';

let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let ExportWatchList = require('./common/ExportWatchList')();
let ExportProject = require('./common/ExportProject')();

let type = 'instagram';

module.exports = {
    exportInstagramWatchList: function() {
        let options = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'instagram_watchlist',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'feedsources'
        };

        let exportWatchList = new ExportWatchList(options);
        exportWatchList.execute((result) => {
            let originId = type + '/' + result.id;
            let data = {
                originId: originId,
                type: type,
                name: result.full_name,
                follows: (result.followed_by && result.followed_by.count) || 0,
                readers: 0,
                velocity: 0,
                dateCreated: new Date(),
                external_url: result.external_url,
                username: result.username,
                profile_pic_url_hd: result.profile_pic_url_hd,
                profile_pic_url: result.profile_pic_url,
                desc: '',
                from: 'imported'
            };
            return data;
        });
    },

    exportInstagramProjects: function() {
        let options = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'instagram',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'projects',

            feedSourcesUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            feedSourcesCollection: 'feedsources'
        };

        let exportProject = new ExportProject(options, type);
        exportProject.execute(function (result, feedSources) {
            let feedSource = feedSources[(result.owner && result.owner.id) || ""];
            let feed = (feedSource && feedSource.toHexString()) || '';
            if (feed) {
                return {
                    id: result.id,
                    code: result.code,
                    type: type,
                    feed: feed,
                    comments: result.comments && result.comments.count,
                    isDel: 0,
                    views: 0,
                    likes: result.likes && result.likes.count,
                    desc: '',
                    caption: result.caption,
                    display_src: result.display_src,
                    is_video: result.is_video,
                    dateCreated: new Date(),
                    lastUpdated: new Date(),
                    from: 'imported'
                };
            } else {
                return null;
            }
        });
    }
};
