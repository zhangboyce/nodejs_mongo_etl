'use strict';

let _ = require('lodash');
let utils = require('./common/utils');
let ExportWatchList = require('./common/ExportWatchList');
let ExportProject = require('./common/ExportProject');

let mongo_config_export = require('./../Config').mongo_config.export;
let mongo_config_import = require('./../Config').mongo_config.import;

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

exports.watchListMongoConfig = function(exportCollection, exportDb='raw') {
    let mongoConfig = {
        exportUrl: `mongodb://${mongo_config_export.host}:${mongo_config_export.port}/${exportDb}`,
        exportCollection: exportCollection,
        exportUsername: mongo_config_export.username,
        exportPassword: mongo_config_export.password,

        importUrl: `mongodb://${mongo_config_import.host}:${mongo_config_import.port}/boom`,
        importCollection: 'feedsources'
    };

    return mongoConfig;
};

exports.projectMongoConfig = function(exportCollection, exportDb='raw') {
    let mongoConfig = {
        exportUrl: `mongodb://${mongo_config_export.host}:${mongo_config_export.port}/${exportDb}`,
        exportCollection: exportCollection,
        exportUsername: mongo_config_export.username,
        exportPassword: mongo_config_export.password,

        importUrl: `mongodb://${mongo_config_import.host}:${mongo_config_import.port}/boom`,
        importCollection: 'projects',

        feedSourcesUrl: `mongodb://${mongo_config_import.host}:${mongo_config_import.port}/boom`,
        feedSourcesCollection: 'feedsources'
    };

    return mongoConfig;
};


