'use strict';

let _ = require('lodash');

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
