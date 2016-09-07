'use strict';

let _ = require('lodash');
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let ExportWatchList = require('./common/ExportWatchList')();
let ExportProject = require('./common/ExportProject')();

let type = 'instagram';

module.exports = {
    exportWatchList: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'instagram_watchlist',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'feedsources'
        };

        let exportWatchList = new ExportWatchList(mongoConfig);
        exportWatchList.execute((result) => {
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
        });
    },

    exportProjects: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'instagram',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'projects',

            feedSourcesUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            feedSourcesCollection: 'feedsources'
        };

        let exportProject = new ExportProject(mongoConfig, type);
        exportProject.execute(function (result, feedSources) {
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
        });
    }
};
