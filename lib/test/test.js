'use strict';

let _ = require('lodash');
let ExportWatchList = require('./../common/ExportWatchList')();
new ExportWatchList().execute(function() {});

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

