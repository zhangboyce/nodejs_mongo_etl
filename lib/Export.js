'use strict';

let _ = require('lodash');
let utils = require('./common/utils');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');
let mongo_config = require('./../Config').mongo_config;

exports.exportWatchList = function(options, mongoConfig, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {'importio': 0};

    let exportWatchList = new ExportWatchList(mongoConfig, criteria, fields);
    exportWatchList.execute(convertorFtn(type));
};

exports.exportProjects = function(options, mongoConfig, convertorFtn) {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = utils.criteria(hours);
    let fields = {'bosonnlp.wordseg': 0};

    let exportProject = new ExportProject(mongoConfig, criteria, fields, type, range);
    exportProject.execute(convertorFtn(type));
};

exports.watchListMongoConfig = function(exportCollection, exportUrl=mongo_config.export_raw_url) {
    let mongoConfig = {
        exportUrl: exportUrl,
        exportCollection: exportCollection,

        importUrl: mongo_config.import_url,
        importCollection: 'feedsources'
    };

    return mongoConfig;
};

exports.projectMongoConfig = function(exportCollection, exportUrl=mongo_config.export_raw_url) {
    let mongoConfig = {
        exportUrl: exportUrl,
        exportCollection: exportCollection,

        importUrl: mongo_config.import_url,
        importCollection: 'projects',

        feedSourcesUrl: mongo_config.import_url,
        feedSourcesCollection: 'feedsources'
    };

    return mongoConfig;
};


