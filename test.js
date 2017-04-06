'use strict';

//let mongoClient = require('mongodb').MongoClient;
////let url = 'mongodb://raw:raw@dds-bp17568c88318c341.mongodb.rds.aliyuncs.com:3717,dds-bp17568c88318c342.mongodb.rds.aliyuncs.com:3717/raw?replicaSet=mgset-1471849';
//let url = 'mongodb://192.168.100.83:27017/test';
//let cheerio = require('cheerio');
//let _ = require('lodash');
//
//let nodejieba = require('nodejieba');
//
////mongoClient.connect(url).then(db => {
////    console.log("Connect mongo db: " + url);
////
////    let collection = db.collection('a');
////    let bulk = collection.initializeUnorderedBulkOp({useLegacyOps: true});
////
////    bulk.find({ b: '1' }).upsert().updateOne({ $set:{ a: '1', b: '2' } });
////
////    collection.update({ b: '1' }, { $set:{ a: '2', b: '2', c: '2' } }, { upsert: true }, (err, result) => {
////        console.log(JSON.stringify(result));
////    });
////
////    //bulk.execute();
////    db.close();
////
////}).catch(err => {
////    console.log("Connect mongo db: " + url + " error." + err);
////});
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

function xxoo() {
    throw new Error('xxoo');
}

function oo() {
    console.log('oo');
}

function xx() {
    try {
        xxoo();
    } catch (e) {
        console.log(e);
    }
    oo();
}

try {
    xx();
} catch(e) {
    console.log(e);
}


let now = new Date();
let f = number => (number>9?'':'0') + number ;
let formatDate = date =>  `${ f(date.getHours()) }`;
console.log(formatDate(now));

