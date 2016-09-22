'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList');
let utils = require('./../common/utils');
let cheerio = require('cheerio');
const Elasticsearch = require('../elasticsearch/Elasticsearch');
let ObjectID = require('mongodb').ObjectID;
let mongoClient = require('mongodb').MongoClient;


let url = 'mongodb://h1iqeel8fr:tb53xiggb9@dds-bp13d9353a884c341.mongodb.rds.aliyuncs.com:3717,dds-bp13d9353a884c342.mongodb.rds.aliyuncs.com:3717/raw';
mongoClient.connect(url).then(db => {

    //let adminDb = db.admin();
    //adminDb.authenticate(username, password);

    console.log("Connect mongo db: " + db);
}).catch(err => {
    console.log( err);
});

