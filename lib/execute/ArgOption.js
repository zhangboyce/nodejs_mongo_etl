'use strict';

let Constant = require('./Constant');

let feed = Constant.TYPE_FEED;
let wechat = Constant.TYPE_WECHAT;
let instagram = Constant.TYPE_INSTAGRAM;
let facebook = Constant.TYPE_FACEBOOK;
let twitter = Constant.TYPE_TWITTER;
let website = Constant.TYPE_WEBSITE;

let project = Constant.DATA_PROJECT;
let feedsource = Constant.DATA_FEEDSOURCE;

let mongo = Constant.IMPORT_MONGO;
let es = Constant.IMPORT_ES;

exports.type = {
    alias:'type',
    type:'string',
    describe: 'the data-type you will export.',
    choices: [feed, wechat, instagram, facebook, twitter, website]
};

exports.data = {
    alias:'data',
    type:'string',
    describe: 'the data you will export.',
    choices: [feedsource, project]
};

exports.hours = {
    demand: 'true',
    alias:'hours',
    type:'number',
    default: 24,
    describe: 'exporting how many hours before.'
};

exports.range = {
    demand: 'true',
    alias:'range',
    type:'number',
    default: 100,
    describe: 'how much data exporting one time.'
};

exports.import = {
    demand: 'true',
    alias:'import',
    type:'string',
    describe: 'import to mongo or es.',
    choices: [mongo, es]
};

exports.cron = {
    alias:'cron',
    type:'string',
    describe: 'cron exp.'
};