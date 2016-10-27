'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList');
let utils = require('./../common/utils');
let cheerio = require('cheerio');
const Elasticsearch = require('../elasticsearch/Elasticsearch');
let ObjectID = require('mongodb').ObjectID;
let mongoClient = require('mongodb').MongoClient;

let topics = [];

let sub = [];
sub.push({_id: 't1_s1', name:'t1_sn1'});
sub.push({_id: 't1_s2', name:'t1_sn2'});
sub.push({_id: 't1_s3', name:'t1_sn3'});

let sub2 = [];
sub2.push({_id: 't2_s1', name:'t2_sn1'});
sub2.push({_id: 't2_s2', name:'t2_sn2'});
sub2.push({_id: 't2_s3', name:'t2_sn3'});

topics.push({_id:'t1', sub: sub});
topics.push({_id:'t2', sub: sub2});

//console.log(JSON.stringify(topics));

let taa = _.find(topics, t => {
    return t.sub && _.find(t.sub, s => {return s._id == 't2_s2'});
});

console.log(_.result(taa, '_id'));
