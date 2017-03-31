'use strict';

let ObjectID = require('mongodb').ObjectID;
let _ = require('lodash');
let nodejieba = require('nodejieba');

exports.extractTags = text => {
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
exports.merge = merge;

exports.copy = (obj) => {
    let newObj = {};
    for (let attrName in obj) { newObj[attrName] = obj[attrName]; }
    return newObj;
};

let newObjectIdByDate = (date)=> {
    if (!date instanceof Date) {
        throw new Error('param type must be a Date.');
    }

    let str = Math.floor(date.getTime()/1000).toString(16) + "0000000000000000";
    return new ObjectID(str);
};

exports.newObjectIdByDate = newObjectIdByDate;

exports.criteria = (hours, criteria = {}) => {
    let _criteria = criteria;
    let _id = _criteria._id || {};

    if (hours == 0) return criteria;

    let current = new Date();
    current.setHours(current.getHours() - Math.abs(hours));
    let objectId = newObjectIdByDate(current);

    if (hours < 0) _id['$lt'] = objectId;
    if (hours > 0) _id['$gt'] = objectId;

    _criteria._id = _id;
    return _criteria;
};

exports.mergeCriteria = (criteria, objectId) => {
    let _objectId = objectId;
    if (!_objectId) {
        _objectId = (criteria._id &&  criteria._id['$gt'] ) || new ObjectID(_.repeat('0', 24));
    }
    let _id = merge(criteria._id || {}, {$gt: _objectId});
    let condition = merge(criteria, {_id:_id});
    return condition;
};