'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let Constant = require('./execute/Constant');
let utils = require('./common/utils');

exports.exportWatchList = function(options) {
    ExportWatchList.exportWatchList(options, 'website_watchlist', convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    ExportProject.exportProjects(options, 'website', convert2Project)
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
                _id: result._id,
                id: result.id,
                title: result.title,
                coverImg: {url: findImgFromHtml(result.html)},
                feed: feed,
                originUrl: result.url,
                type: type,
                dateImported: new Date(),
                datePublished: result.crawl_time,
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
