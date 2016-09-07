'use strict';

let co = require('co');
let ConnectMongo = require('../common/ConnectMongo');
let es = require('elasticsearch');
let Elasticsearch = require('../elasticsearch/Elasticsearch')();

let elasticsearch = new Elasticsearch('boyce', 'document');
//elasticsearch.initIndex();
//elasticsearch.initMapping({
//    title0: {type: 'string'},
//    title1: {type: 'string'},
//    title2: {type: 'string'}
//}).then(result => {
//    console.log(JSON.stringify(result));
//}).catch(err => {
//    console.log(err);
//});

//elasticsearch.addDocument({
//    id: 2,
//    title0: 'xxx dsd',
//    title1: 'ooo ss xsad',
//    title2: 'dddascxx'
//
//}).then(result => {
//    console.log(JSON.stringify(result));
//}).catch(err => {
//    console.error(err);
//});
//
//elasticsearch.count().then(count => {
//    console.log(count.count);
//});

elasticsearch.batch({
    id: 4,
    name: 'xxx dsd  4',
    age: 'ooo ss xsad',
    desc: 'dddascxx'
});

elasticsearch.batch({
    id: 5,
    name: 'xxx dsd  5',
    age: 'ooo ss xsad',
    desc: 'dddascxx'
});

elasticsearch.batch({
    id: 6,
    name: 'xxx dsd  6',
    age: 'ooo ss xsad',
    desc: 'dddascxx'
});

elasticsearch.execute();

elasticsearch.searchAll().then(results => {
    console.log(JSON.stringify(results));
});
