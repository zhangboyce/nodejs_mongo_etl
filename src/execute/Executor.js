'use strict';

let _ = require('lodash');
let etl = require('../../index');
let Constant = require('./Constant');

let feed = Constant.TYPE_FEED;
let wechat = Constant.TYPE_WECHAT;
let instagram = Constant.TYPE_INSTAGRAM;
let facebook = Constant.TYPE_FACEBOOK;
let twitter = Constant.TYPE_TWITTER;
let website = Constant.TYPE_WEBSITE;

let project = Constant.DATA_PROJECT;
let feedsource = Constant.DATA_FEEDSOURCE;

module.exports = Executor;

function Executor(options) {
    this.options = options;

    this.executors = this.init();
}

Executor.prototype.import2Mongo = function() {

    let handleTypeMap = (data, typeMap) => {
        let _executor = this.options.type?typeMap.get(this.options.type):typeMap;

        if (_executor instanceof Function) {
            _executor.call(this, _.assign({}, this.options));
            console.log(`> Execute ${this.options.type}, ${data} ... ...`);
        }
        if (_executor instanceof Map) {
            for (let [key, value] of _executor) {
                value.call(this, _.assign({}, this.options, {type: key}));
                console.log(`> Execute ${key}, ${data} ... ...`);
            }
        }
    };

    if (this.options.data) {
        handleTypeMap(this.options.data, this.executors.get(this.options.data));
    } else {
        for (let [key, value] of this.executors) {
            handleTypeMap(key, value);
        }
    }
};

Executor.prototype.import2ES = function() {
    let ftn = (_options) => {
        if (!this.options.data) {
            etl.ImportFeedSource2ES(_options);
            etl.ImportProject2ES(_options);
        }
        if (this.options.data === feedsource) etl.ImportFeedSource2ES(_options);
        if (this.options.data === project) etl.ImportProject2ES(_options);
    };
    
    if (!this.options.type) {
        [feed, wechat, instagram, facebook, twitter, website].forEach(type => {
            let _options = _.assign({}, this.options, {type: type});
            ftn(_options);
        });
    } else {
        ftn(this.options);
    }
};

Executor.prototype.importRaL = function() {

    if (this.options.type != Constant.TYPE_WECHAT) {
        console.log('Cannot import read and like num from type expect wechat. type: ' + this.options.type );
        return;
    }
    etl.ImportWeixinReadAndLikeNum(this.options);
};

Executor.prototype.init = () => {
    let executors = new Map();
    let projectMap = new Map();
    let feedsourceMap = new Map();

    projectMap.set(feed, etl.ExportRssProjects);
    projectMap.set(wechat, etl.ExportWeixinProjects);
    projectMap.set(instagram, etl.ExportInstagramProjects);
    projectMap.set(facebook, etl.ExportFacebookProjects);
    projectMap.set(twitter, etl.ExportTwitterProjects);
    projectMap.set(website, etl.ExportWebsiteProjects);

    feedsourceMap.set(feed, etl.ExportRssWatchList);
    feedsourceMap.set(wechat, etl.ExportWeixinWatchList);
    feedsourceMap.set(instagram, etl.ExportInstagramWatchList);
    feedsourceMap.set(facebook, etl.ExportFacebookWatchList);
    feedsourceMap.set(twitter, etl.ExportTwitterWatchList);
    feedsourceMap.set(website, etl.ExportWebsiteWatchList);

    executors.set(feedsource, feedsourceMap);
    executors.set(project, projectMap);

    return executors;
}