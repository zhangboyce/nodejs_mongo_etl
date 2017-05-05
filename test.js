'use strict';

let mongoClient = require('mongodb').MongoClient;
let url = 'mongodb://raw:raw@dds-bp17568c88318c341.mongodb.rds.aliyuncs.com:3717,dds-bp17568c88318c342.mongodb.rds.aliyuncs.com:3717/raw?replicaSet=mgset-1471849';
//let url = 'mongodb://192.168.100.83:27017/test';
//let cheerio = require('cheerio');
//let _ = require('lodash');
//
//let nodejieba = require('nodejieba');
//

//let start = Date.now();
//mongoClient.connect(url).then(db => {
//    db.close();
//    console.log(`Connect mongo db: ${ url }, and take: ${ (Date.now() - start)/1000 } s.`);
//}).catch(err => {
//    console.log("Connect mongo db: " + url + " error." + err);
//});
//
//start = Date.now();
//mongoClient.connect(url).then(db => {
//    db.close();
//    console.log(`Connect mongo db: ${ url }, and take: ${ (Date.now() - start)/1000 } s.`);
//}).catch(err => {
//    console.log("Connect mongo db: " + url + " error." + err);
//});


//
//
//function handleTextContent(html) {
//    if (!html) return '';
//    let $ = cheerio.load(html);
//
//    let text_content = $('.rich_media_content').text();
//    let biz_name = $('.profile_nickname').text();
//    return text_content;
//}
//
//
//function handleText(html) {
//    if (!html)return '';
//
//    let $ = cheerio.load(html);
//    return $('body').text();
//}
//
//function handleHtml(html) {
//    if (!html)return '';
//
//    let $ = cheerio.load(html);
//    return $('body').html();
//}
//
//let {a, b} = xx();
//console.log(a);
//console.log(b);
//
//function xx() {
//    return {a: 'a', b: 'b'};
//}
//
//var sentence = "Hair Hunting #5 with Sonam Kapoor x Sensual Hair - CANNES 2016 \nA bit wavy, simple and fun the perfect look for the #lorealcannes2016 red carpet with Sonam Kapoor #sensual hair. More inspirations to come! #hairhunting #hairobsession";
//var result;
//
//result = nodejieba.extract(sentence, 10);
//
//console.log(result);
//
//console.log(_.map(result, r=> r.word));
//
//console.log(Date.now());
//
//console.log(new Date());
//

//function xxoo() {
//    throw new Error('xxoo');
//}
//
//function oo() {
//    console.log('oo');
//}
//
//function xx() {
//    try {
//        xxoo();
//    } catch (e) {
//        console.log(e);
//    }
//    oo();
//}
//
//try {
//    xx();
//} catch(e) {
//    console.log(e);
//}
//
//
//let now = new Date();
//let f = number => (number>9?'':'0') + number ;
//let formatDate = date =>  `${ f(date.getHours()) }`;
//console.log(formatDate(now));


//let redis = require('redis');
//let client = redis.createClient({
//    "host":"8f2f23a8ab9a47ba.m.cnhza.kvstore.aliyuncs.com",
//    "port":6379,
//    "password":"e3aEqW8834Sra4i",
//    "db":67
//});
//
//
//client.hmget('article_read_like', ['MzA3MTYyMTExNA==_2655640819_4','s', 'MzA3Njg2ODcxNw==_2671749791_2'] , (err, results) => {
//    for (let result of results) {
//        console.log(result);
//    }
//});
//
//client.quit();


//let utils = require('./src/common/utils');
//let _ = require('lodash');
//
//let c = { _id: { '$gt': '0000000000000' } };
//
//console.log(utils.mergeCriteria(c));
//
//console.log(Object.assign({}, c, { _id: Object.assign({}, c._id, { '$gt': '999999999999' }) }));
//
//
//let ConnectMongo = require('./src/common/ConnectMongo');
//let co = require('co');
//co(function *() {
//    let db = yield ConnectMongo('mongodb://192.168.100.83:27017/boom');
//    let result = yield db.collection('projects').find({}, { _id: 1 }).sort({ _id: -1 }).limit(1).toArray();
//
//    db.close();
//    console.log(result);
//});



console.log(new Date("Sun Jul 24 10:23:48 +0000 2016"));