#!/usr/bin/env node
'use strict';

let ConnectMongo = require('./src/common/ConnectMongo');
let co = require('co');
let config = require('config');
let ObjectID = require('mongodb').ObjectID;
let mongo_url = config.get('mongo.import');

co(function* () {
    let boom_db;
    try {
        boom_db = yield ConnectMongo(mongo_url);

        let feedsources_collection = boom_db.collection('feedsources');
        let subscribes_collection = boom_db.collection('subscribes');

        // score by subscribe
        let cursor = subscribes_collection.aggregate([
            { $group: {
                _id: '$feed',
                count: { $sum: 1 }
            } }
        ]);

        let feed_subscribe_counts = yield cursor.toArray();
        for (let i=0; i<feed_subscribe_counts.length; i++) {
            let it = feed_subscribe_counts[i];

            let feedsource = yield feedsources_collection.findOne({ _id: new ObjectID(it._id) });
            let weight = feedsource.weight || {};
            let subscribed = weight.subscribed || 0;
            let score = weight.score || 0;

            let inc_score = (it.count - subscribed) * 10;
            if (inc_score != 0) {
                weight.subscribed = it.count;
                weight.score = score + inc_score;

                yield feedsources_collection.updateOne({ _id: new ObjectID(it._id) }, { $set: { weight: weight } });
                console.log(`Update feed (_id: ${ it._id }) to inc score ${ inc_score } because of it has been inc subscribed ${ it.count } times.`);
            }
        }
        
    } catch(e) {
        console.log(e);
    }

    boom_db && boom_db.close();
}.bind(this));

