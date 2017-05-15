'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let nodejieba = require('nodejieba');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let utils = require('./common/utils');
let Constant = require('./execute/Constant');
let Context = require('./common/Context');

exports.exportWatchList = function(options) {
    ExportWatchList.exportWatchList(options, 'weixin_watchlist', convertWatchList2FeedSource)
};

exports.exportProjects = function(options) {
    ExportProject.exportProjects(options, 'weixin_article_list', convert2Project)
};

function convertWatchList2FeedSource(type) {
    return (result) => {
        let originId = type + '/' + result.biz;
        return {
            id: result.biz,
            name: result.biz_name,
            type: type,
            originId: originId,
            iconUrl: result.avatar,
            readers: 0,
            velocity: 0,
            dateImported: new Date(),
            desc: result.description,
            from: 'imported'
        };
    }
}

function convert2Project(type) {
    return (result, feedSources) => {
        if (!result) return null;

        let feed = feedSources[result.biz] && feedSources[result.biz].toHexString();
        if (feed) {
            let { biz_name, text_content } = handleTextContent(result.html);

            let datetime = result.comm_msg_info && result.comm_msg_info.datetime;
            let datePublished = datetime ? new Date(datetime*1000): result.crawl_time;

            let id = [result.biz, result.mid, result.idx].join('_');

            let tags = utils.extractTags(text_content);

            return {
                _id: result._id,
                id: id,
                title: result.title,
                biz_name: biz_name,
                coverImg: {url: result.cover || findImgFromHtml(result.html)},
                feed: feed,
                originUrl: result.content_url,
                type: type,
                dateImported: new Date(),
                datePublished: datePublished,
                tags: tags,
                isDel: 0,
                desc: result.digest || (text_content && text_content.trim().substring(0, 30)),

                html_content: handleHtml(result.html),
                from: 'imported'
            };
        } else {
            return null;
        }
    };

    function handleTextContent(html) {
        if (!html) return {};
        let $ = cheerio.load(html);

        let text_content = $('.rich_media_content').text();
        let biz_name = $('.profile_nickname').text();

        return { biz_name: biz_name, text_content: text_content }
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

