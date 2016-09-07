'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList')();
let cheerio = require('cheerio');
let ObjectID = require('mongodb').ObjectID;

let o1 = {o1: 'o1'};
let o2 = Object.create(o1);

[].prototype

function Graph() {
    this.vertexes = [];
    this.edges = [];
}

//Graph.prototype = {
//    addVertex: function(v){
//        this.vertexes.push(v);
//    }
//};

Graph.prototype.xxoo = "xxoo";

var g = new Graph();

function A(a){
    this.varA = a;
}

let obj = _.assign(obj2, obj1);
console.log(obj1);
console.log(obj2);
console.log(obj);

function merge(obj1, obj2){
    var obj3 = {};
    for (var attrName in obj1) { obj3[attrName] = obj1[attrName]; }
    for (var attrName in obj2) { obj3[attrName] = obj2[attrName]; }
    return obj3;
}

let objectId = new ObjectID(_.repeat('0', 24));
console.log(objectId);


let $ = cheerio.load(`<p style="text-align: center; line-height: normal;"><img data-s="300,640" data-type="jpeg" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbbdu2DuAlIDswkYBELcGJES9MqlehaCLgpOMDvwIQ7X1y5GeoQAbDXA/0?wx_fmt=jpeg" data-ratio="0.4982014388489209" data-w="" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/ad0633c1fc6ed99f59a2fb89e656270e.jpeg" style="width: 589.5px;"></p><p style="line-height: 20px; text-align: center;"><br></p><div class="boom-video" style="line-height: 20px; text-align: center;"><iframe webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" frameborder="0" height="310" width="500" src="http://v.qq.com/iframe/player.html?vid=c0177a7pevs&amp;amp;auto=0" class="note-video-clip"></iframe></div><p style="line-height: 20px; text-align: center;"><br></p><p style="text-align: center; line-height: normal;"><span style="font-size: 14px;">可口可乐在丹麦树了一个广告牌，丹麦人民懵了。<br></span></p><p style="line-height: normal; text-align: center;"><img data-s="300,640" data-type="jpeg" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cb9coOKDEwcsP46HbQ0GO7Q7mLFQ391KKRdCriaqaeLofFU9bpQoBdiaYQ/0?wx_fmt=jpeg" data-ratio="0.5575539568345323" data-w="" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/071421f25b50001ab57fd93a80e55434.jpeg"></p><p style="line-height: normal; text-align: center;"><img data-type="gif" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbbsDy1lVia9nC5883k0Qu9vWicEHPELl3xAYXgE7ib4tY9ibQVkQ1R964eQ/0?wx_fmt=gif" data-ratio="0.5625" data-w="480" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/48271f64a52c760bff1abd929f0f67c5.gif"><br><span style="font-size: 14px;">这什么鬼？</span></p><p style="line-height: normal; text-align: center;"><span style="font-size: 14px;">他们看到的是这个：</span></p><p style="line-height: normal; text-align: center;"><img data-s="300,640" data-type="jpeg" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbsIic7qEiaQAH8QHNdy5siaaWtu3Ktl6UHMg7iaxO9AZ7J3j9fkyrOO4IKQ/0?wx_fmt=jpeg" data-ratio="1" data-w="450" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/9285379812b752e2ea6e3f2a3fd113a9.jpeg"><br></p><p style="text-align: center; line-height: normal;"><span style="font-size: 14px;">这是一个只有5%的人才能看懂的广告。</span></p><p style="line-height: 20px; text-align: center;"><span style="font-size: 14px;">上面那些密密麻麻的原点组成的图案，其实是用来测试色盲的石原测试图，全称“<strong>石原氏色盲检测图</strong>”，这是一种检测</span><span style="font-size: 14px;">色觉</span><span style="font-size: 14px;">障碍</span><span style="font-size: 14px;">的方法，得名于它的发明者，日本</span><span style="font-size: 14px;">东京大学</span><span style="font-size: 14px;">教授石原忍。这种测试图包括一系列彩色圆盘，称为“石原盘”，每个圆盘内布满多种颜色和大小的圆点。其中一部分圆点以色盲者不易区分的颜色组成一个或几个数字。色觉正常者能够很容易分辨出这些数字，而色盲患者则无法或很难分辨。</span></p><p style="text-align: center; line-height: normal;"><img data-s="300,640" data-type="jpeg" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbKYbQWhd0tpIh3b2SwxnfSthcpBURCl4aNcQL6cH67aIS8OID8ao5IQ/0?wx_fmt=jpeg" data-ratio="1.2122302158273381" data-w="" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/af8d76521c01b6d5caeef989e4e15d3b.jpeg"></p><p style="line-height: normal; text-align: center;"><span style="font-size: 14px;">比如上面这张图，你能辨别其中的字符吗？</span></p><p style="line-height: normal; text-align: center;"><img data-type="gif" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbOKglnFJelyjibf0swjcKibT6nwwiaKODnQ2o5e9HGg2sPsf4ic34eNGSQQ/0?wx_fmt=gif" data-ratio="0.5625" data-w="480" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/8dbf1f2469b67559988542beff87aa51.gif"></p><p style="line-height: normal; text-align: center;"><img data-type="gif" data-src="http://mmbiz.qpic.cn/mmbiz/QCcEVwTnSPr9NaNQS8PceGT5EHJVj7cbYhnGBXtZiaWv9yXOHdbqo5NAn3sQOic1zAZ6WYl4TPzBnkpFOPwud2JQ/0?wx_fmt=gif" data-ratio="0.5625" data-w="480" src="http://7xl3tq.com1.z0.glb.clouddn.com/wechat/ed4410246f260f7cc1a923b74a1b81a9.gif"></p><p style="line-height: 20px; text-align: center;"><span style="font-size: 14px;">在我们眼中红色的可口可乐，可能在色盲或者色弱患者眼中就是另一个样子。</span><br></p><p style="text-align: center; line-height: normal;"><span style="font-size: 14px;">这种有争议的做法成功的吸引了媒体的注意和报导，幸好在丹麦它没有引起什么非议。<br></span></p><p style="text-align: center; line-height: normal;"><span style="font-size: 14px;">不过用这种方式引起人们对色觉障碍群体的关注也不失为一件好事。</span></p><p style="text-align: center; line-height: normal;"><br></p>`);
console.log($.text());


function getPromise() {
    let array = [1,2,3];
    return new Promise((resolve, reject) => {
        resolve(array);
    });
}

function xx() {
    return getPromise().then(array => {
        console.log(array.toString());
        let promises = [];
        _.map(array, item => {
            promises.push(Promise.resolve(item * 2));
        });
        return Promise.all(promises);
    });
}

xx().then(array => {
    console.log(array.toString());
});


(function oo() {
    return Promise.resolve('oo').then(oo => {
        console.log(oo);
        return oo + 'xx';
    })
    //    .then(ooxx => {
    //    console.log('inner: ' + ooxx);
    //})
        ;
})().then(ooxx => {
    console.log('outer: ' + ooxx);
});

function f1(value, callback) {
    console.log('f1: ' + value);
    callback(value + 1);
}

function f2(value, callback) {
    console.log('f2: ' + value);
    callback(value + 1);
}

function f3(value, callback) {
    console.log('f3: ' + value);
    callback(value + 1);
}

f1(1, function(value) {
    f2(value, function(value) {
        f3(value, function(value) {
            console.log('final: ' + value);
            console.log('f3 completed.');
        });
        console.log('f2 completed.');
    });
    console.log('f1 completed.');
});


(function () {
    var X = function() {
        console.log('X');
    };

    var x1 = new X();
    var x2 = X();
    console.log(typeof x1);
    console.log(typeof x2);
})();