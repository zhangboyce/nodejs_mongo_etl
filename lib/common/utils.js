'use strict';

module.exports = {
    merge: merge,
    copy: copy
};

function merge(obj1, obj2){
    var obj3 = {};
    for (var attrName in obj1) { obj3[attrName] = obj1[attrName]; }
    for (var attrName in obj2) { obj3[attrName] = obj2[attrName]; }
    return obj3;
}

function copy(obj) {
    let newObj = {};
    for (var attrName in obj) { newObj[attrName] = obj[attrName]; }
    return newObj;
}