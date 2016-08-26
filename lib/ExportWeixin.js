'use strict';

let _ = require('lodash');
let logger = require('tracer').colorConsole();
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let ExportWatchList = require('./common/ExportWatchList')();
let ExportProject = require('./common/ExportProject')();

let type = 'wechat';

module.exports = {
    exportWeixinWatchList: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/raw`,
            exportCollection: 'weixin_watchlist',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'feedsources'
        };

        let exportWatchList = new ExportWatchList(mongoConfig);
        exportWatchList.execute((result) => {
            let originId = type + '/' + result.biz;
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
                desc: result.description,
                from: 'imported_3'
            };
            return data;
        });
    },

    exportWeixinProjects: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/contentpool`,
            exportCollection: 'weixin',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'projects',

            feedSourcesUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            feedSourcesCollection: 'feedsources'
        };

        let exportProject = new ExportProject(mongoConfig, type);
        exportProject.execute(function (result, feedSources) {
            let keywords = result.bosonnlp && result.bosonnlp.keywords;
            let tags = _.slice(_.map(keywords, keyword => {
                return keyword[1]
            }), 0, 10);
            let feed = feedSources[result.biz].toHexString();
            if (feed) {
                return {
                    title: result.title,
                    originUrl: result.url,
                    type: type,
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
                    from: 'imported_3'
                };
            } else {
                return null;
            }
        });
    }
};
