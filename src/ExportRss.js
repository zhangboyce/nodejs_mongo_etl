'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Constant = require('./execute/Constant');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    //let mongoConfig = Export.watchListMongoConfig('rss_watchlist');
    //Export.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    ExportProject.exportProjects(options, 'rss', convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {

    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        if (!result) return null;

        let feed = feedSources[result.feed] && feedSources[result.feed].toHexString();
        if (feed) {

            let text_content = handleText(result.html_content);
            let tags = utils.extractTags(text_content);

            return {
                _id: result._id,
                id: result.id,
                title: result.title,
                coverImg: {url: findImgFromHtml(result.html)},
                feed: feed,
                originUrl: result.url,
                type: type,
                dateImported: new Date(),
                datePublished: result.published?new Date(result.published):result.crawl_time,
                tags: tags,
                isDel: 0,
                desc: text_content && text_content.substring(0, 30),

                html_content: handleHtml(result.html_content),
                from: 'imported'
            };
        } else {
            return null;
        }
    };

    function handleText(html) {
        if (!html)return '';

        let $ = cheerio.load(html);
        return $('body').text();
    }

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
