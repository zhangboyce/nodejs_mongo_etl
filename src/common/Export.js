'use strict';

let _ = require('lodash');
let utils = require('./utils');
let ExportWatchList = require('./ExportWatchList');
let ExportProject = require('./ExportProject');

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


