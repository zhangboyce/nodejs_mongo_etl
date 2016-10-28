'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList');
let utils = require('./../common/utils');
let cheerio = require('cheerio');
const Elasticsearch = require('../elasticsearch/Elasticsearch');
let ObjectID = require('mongodb').ObjectID;
let mongoClient = require('mongodb').MongoClient;


console.log(new Date().getTime());