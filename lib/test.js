'use strict';

let _ = require('lodash');

new Promise((resolve, reject) => {
    _.forEach([4,2,3], item => {
       resolve(item);
    });
}).then(item => {
    console.log(item);
}).then(item => {
    console.log(item);
}).then(item => {
    console.log(item);
});