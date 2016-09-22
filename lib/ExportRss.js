'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Export = require('./Export');
let mongo_config = require('./../Config').mongo_config;

exports.exportWatchList = function(options) {
    //let mongoConfig = Export.watchListMongoConfig('rss_watchlist');
    //Export.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = Export.projectMongoConfig('rss', mongo_config.export_content_url);
    Export.exportProjects(options, mongoConfig, convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {

    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        let keywords = result.bosonnlp && result.bosonnlp.keywords;
        let tags = _.slice(_.map(keywords, keyword => {return keyword[1]}), 0, 10);
        let feed = feedSources[result.feed] && feedSources[result.feed].toHexString();

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
                datePublished: result.published?new Date(result.published):this.dateCreated,
                tags: tags,
                isDel: 0,
                desc: result.text_content && result.text_content.substring(0, 30),

                html_content: handleHtml(result.html_content),
                from: 'imported'
            };
        } else {
            return null;
        }
    };

    function handleHtml(html) {
        if (!html)return '';

        let $ = cheerio.load(html);
        return $('body').html();
    }

    function findImgFromHtml(html) {
        if (!html) return '';
        let $ = cheerio.load(html);
        let imgUrls = $('img');
        if (imgUrls && imgUrls.length > 0) {
            return $(imgUrls[0]).attr('src');
        } else {
            return '';
        }
    }
}
