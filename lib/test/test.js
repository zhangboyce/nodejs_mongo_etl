'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList');
let utils = require('./../common/utils');
let cheerio = require('cheerio');
const Elasticsearch = require('../elasticsearch/Elasticsearch');
let ObjectID = require('mongodb').ObjectID;


let s3 = '57a1c70107ce6e01651f70e6';


let o = new ObjectID(s3);
console.log(o.getTimestamp());


console.log(Math.floor(new Date()/1000).toString(16) + "0000000000000000");

let d = new Date();
d.setHours(d.getHours() - 2);
console.log(utils.newObjectIdByDate(d));
console.log(utils.newObjectIdByDate(new Date()));

console.log(new Date(null));



let get = Map.prototype.get;
Map.prototype.get = function() {

};


