'use strict';

let es = require('elasticsearch');
let _ = require('lodash');

module.exports = Elasticsearch;

function Elasticsearch(indexName, type, config) {
    this.indexName = indexName;
    this.type = type;

    this.client = new es.Client(_.assign({}, config));
    this.bulk = [];
}

Elasticsearch.prototype.deleteIndex = function() {
    return this.indexExists(this.indexName).then(exists => {
        if (exists) {
            return this.client.indices.delete({
                index: this.indexName
            });
        } else {
            return Promise.reject(new Error(`${this.indexName} not exists.`));
        }
    });
};

Elasticsearch.prototype.initIndex = function() {
    return this.indexExists(this.indexName).then(exists => {
        if (!exists) {
            return this.client.indices.create({
                index: this.indexName
            });
        } else {
            return Promise.reject(new Error(`can not init multi ${this.indexName}.`));
        }
    });
};

Elasticsearch.prototype.indexExists = function() {
    return this.client.indices.exists({
        index: this.indexName
    });
};

Elasticsearch.prototype.initMapping = function(mapping) {
    return this.indexExists(this.indexName).then(exists => {
        if (exists) {
            return this.client.indices.putMapping({
                index: this.indexName,
                type: this.type,
                body: {
                    properties: mapping
                }
            });
        } else {
            return Promise.reject(new Error(`${this.indexName} not exists.`));
        }
    });
};

Elasticsearch.prototype.addDocument = function(document) {
    return this.indexExists(this.indexName).then(exists => {
        if (exists) {
            return this.client.index({
                index: this.indexName,
                type: this.type,
                id: document.id,
                body: document,
                refresh: true
            });
        } else {
            return Promise.reject(new Error(`${this.indexName} not exists.`));
        }
    });
};

Elasticsearch.prototype.count = function() {
    return this.client.count({
        index: this.indexName,
        type: this.type
    });
};

Elasticsearch.prototype.searchAll = function() {
    return this.search({
        match_all:{}
    });
};

Elasticsearch.prototype.search = function(query) {
    return this.client.search({
        index: this.indexName,
        type: this.type,
        body: {
            query: query
        }
    });
};

Elasticsearch.prototype.execute = function() {
    let promise = this.client.bulk({
        body : this.bulk
    });
    this.bulk = [];

    return promise;
};

Elasticsearch.prototype.batchSize = function() {
    return this.bulk.length/2;
};

Elasticsearch.prototype.batch = function(document) {
    this.bulk.push({index: {_index: this.indexName, _type: this.type, _id: document.id}});
    this.bulk.push(document);
};

Elasticsearch.prototype.close = function() {
    this.client.close();
    //console.log('close es!!!');
};


