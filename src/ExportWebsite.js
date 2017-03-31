'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Constant = require('./execute/Constant');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    let mongoConfig = ExportWatchList.watchListMongoConfig('website_watchlist');
    ExportWatchList.exportWatchList(options, mongoConfig, convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    let mongoConfig = ExportProject.projectMongoConfig('website');
    ExportProject.exportProjects(options, mongoConfig, convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
        let originId = type + '/' + result.link;
        let data = {
            id: result._id.toString(),
            name: result.title,
            type: type,
            originId: originId,
            iconUrl: '',
            readers: 0,
            velocity: 0,
            dateImported: new Date(),
            desc: '',
            from: 'imported'
        };
        return data;
    }
}

function convert2Project(type) {
    return (result, feedSources) => {

        let feed = feedSources[result.website].toHexString();
        if (feed) {

            let text_content = handleText(result.html);
            let tags = utils.extractTags(text_content);

            return {
                id: result.id,
                title: result.title,
                coverImg: {url: findImgFromHtml(result.html)},
                feed: feed,
                originUrl: result.url,
                type: type,
                dateImported: new Date(),
                datePublished: new Date(),
                tags: tags,
                isDel: 0,
                desc: text_content && text_content.substring(0, 30),
                html_content: handleHtml(result.html),

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
