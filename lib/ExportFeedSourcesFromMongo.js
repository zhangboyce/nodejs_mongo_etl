'use strict';

let dataPumps = require('datapumps');
let mongoClient = require('mongodb').MongoClient;
let Promise = require('bluebird');
let Pump = dataPumps.Pump;
let MongodbMixin = dataPumps.mixin.MongodbMixin;
let pump = new Pump();

module.exports = function() {

    let fromMongo = "mongodb://192.168.60.144/boom";
    let toMongo = "mongodb://localhost/boom";
    let collection = "feedsources";

    mongoClient.connect(toMongo, function(err, db) {

        let mongodbMixin = MongodbMixin(fromMongo);
        pump = pump.mixin(mongodbMixin);
        pump = pump.useCollection('feedsources');

        let stream = pump.find({},{},{});
        pump = pump.from(stream);

        console.log(stream);

        //pump = pump.mixin(MongodbMixin(toMongo)).useCollection(collection);

        pump.process(function(data) {
            delete data._id;
            console.log(data);

            let coll = db.collection('feedsources');
            return Promise.resolve(coll.updateOne({originId: data.originId}, data, {upsert: true}));
        })
        .logErrorsToConsole()
        .run()
        .then(function() {
            console.log("Done writing rss to file");
            db.close();
        });
    });
};
