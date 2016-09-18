'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ConnectMongo = require('./common/ConnectMongo');
let mongo_config_pro = require('./common/Constant').mongo_config.pro;
let mongo_config_dev = require('./common/Constant').mongo_config.dev;
let ExportWatchList = require('./common/ExportWatchList')();
let ExportProject = require('./common/ExportProject')();

let type = 'wechat';

module.exports = {
    exportWatchList: function(options) {
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
                id: result.biz,
                name: result.biz_name,
                type: type,
                originId: originId,
                iconUrl: result.avatar,
                readers: 0,
                velocity: 0,
                dateCreated: new Date(),
                lastUpdated: new Date(),
                desc: result.description,
                from: 'imported'
            };
            return data;
        });
    },

    exportProjects: function(options) {
        let opts = options || {};

        let mongoConfig = {
            exportUrl: `mongodb://${mongo_config_pro.host}:${mongo_config_pro.port}/contentpool`,
            exportCollection: 'weixin',

            importUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            importCollection: 'projects',

            feedSourcesUrl: `mongodb://${mongo_config_dev.host}:${mongo_config_dev.port}/boom`,
            feedSourcesCollection: 'feedsources'
        };

        let _criteria = {};
        let _options = {"bosonnlp.wordseg":0};

        let exportProject = new ExportProject(mongoConfig, type, _criteria, _options);
        exportProject.execute(function (result, feedSources) {
            let keywords = result.bosonnlp && result.bosonnlp.keywords;
            let tags = _.slice(_.map(keywords, keyword => {
                return keyword[1]
            }), 0, 10);
            let feed = feedSources[result.biz].toHexString();
            if (feed) {
                return {

                    id: result.id,
                    title: result.title,
                    coverImg: {url: findImgFromHtml(result.html)},
                    feed: feed,
                    originUrl: result.url,
                    type: type,
                    dateCreated: new Date(),
                    lastUpdated: new Date(),
                    views: 0,
                    likes: 0,
                    tags: tags,
                    isDel: 0,
                    desc: result.text_content && result.text_content.substring(0, 30),

                    html_content: handleHtml(result.html),
                    from: 'imported'
                };
            } else {
                return null;
            }
        });

        function handleHtml(html) {
            if (!html) return '';

            let $ = cheerio.load(html);
            let page_content = $('#page-content');
            let imgs = page_content.find('img');
            for (let i=0; i<imgs.length; i++) {
                let img = imgs[i];
                let data_src = $(img).attr('data-src');
                if (data_src) {
                    $(img).attr('src', data_src);
                    $(img).attr('data-src', '');
                }
            }
            return page_content.html();
        }

        function findImgFromHtml(html) {
            if (!html) return '';
            let $ = cheerio.load(html);
            let imgUrls = $('img[data-src]');
            if (imgUrls && imgUrls.length > 0) {
                return $(imgUrls[0]).attr('data-src');
            } else {
                return '';
            }
        }
    }
};
