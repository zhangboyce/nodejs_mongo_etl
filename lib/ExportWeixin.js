'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Export = require('./Export');

exports.exportWatchList = function(options) {
    let mongoConfig = Export.watchListMongoConfig('weixin_watchlist');
    Export.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = Export.projectMongoConfig('weixin', 'contentpool');
    Export.exportProjects(options, mongoConfig, convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
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
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        let keywords = result.bosonnlp && result.bosonnlp.keywords;
        let tags = _.slice(_.map(keywords, keyword => { return keyword[1] }), 0, 10);
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
                datePublished: new Date(result.date),
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
    }

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

