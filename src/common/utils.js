'use strict';

let ObjectID = require('mongodb').ObjectID;
let _ = require('lodash');
let nodejieba = require('nodejieba');

let extractTags = text => {
    let tags = [];
    if (text) {
        let result = nodejieba.extract(text, 10);
        tags = _.map(result, r => r.word);
    }
    return tags;
};

let merge = (obj1, obj2) => {
    let obj3 = {};
    for (let attrName in obj1) { obj3[attrName] = obj1[attrName]; }
    for (let attrName in obj2) { obj3[attrName] = obj2[attrName]; }
    return obj3;
};

let copy = obj => {
    let newObj = {};
    for (let attrName in obj) { newObj[attrName] = obj[attrName]; }
    return newObj;
};

let criteria = hours => {
    if (hours == 0 || !hours) return {};

    let current = new Date();
    current.setHours(current.getHours() - Math.abs(hours));
    let str = Math.floor(current.getTime()/1000).toString(16) + "0000000000000000";
    let objectId = new ObjectID(str);

    if (hours < 0) return { _id: { '$lt': objectId } };
    if (hours > 0) return { _id: { '$gt': objectId } };
};

let mergeCriteria = (criteria, objectId) => {
    if (!objectId) return criteria;
    return Object.assign({}, criteria, { _id: Object.assign({}, criteria._id || {}, { '$gt': objectId }) });
};

exports.merge = merge;
exports.extractTags = extractTags;
exports.copy = copy;
exports.criteria = criteria;
exports.mergeCriteria = mergeCriteria;