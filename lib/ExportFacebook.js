'use strict';

let _ = require('lodash');
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let ExportWatchList = require('./common/ExportWatchList')();
let ExportProject = require('./common/ExportProject')();

let type = 'facebook';

module.exports = {
    exportWatchList: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'facebook_watchlist',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'feedsources'
        };

        let exportWatchList = new ExportWatchList(mongoConfig);
        exportWatchList.execute((result) => {
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
        });
    },

    exportProjects: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'facebook',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'projects',

            feedSourcesUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            feedSourcesCollection: 'feedsources'
        };

        let _criteria = {};
        let _options = {};

        let exportProject = new ExportProject(mongoConfig, type, _criteria, _options);
        exportProject.execute(function (result, feedSources) {

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
                    views: 0,
                    likes: 0,
                    tags: [],
                    isDel: 0,
                    desc: result.message,
                    from: 'imported'
                };
            } else {
                return null;
            }
        });
    }
};