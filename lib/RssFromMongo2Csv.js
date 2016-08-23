'use strict';

let dataPumps = require('datapumps');
let mongoClient = require('mongodb').MongoClient;
let Pump = dataPumps.Pump;
let MongodbMixin = dataPumps.mixin.MongodbMixin;
let CsvWriterMixin = dataPumps.mixin.CsvWriterMixin;
let pump = new Pump();

module.exports = function() {
    let username = "h1iqeel8fr";
    let password = "tb53xiggb9";
    let url = "mongodb://100.99.164.67:3717/contentpool";
    let collection = "rss";

    let condition = {};
    let fields = {};
    let options = {limit:10};

    let outputFile = "/Users/Boyce/tmp/rss_export_from_mongo.csv";
    let headers = ["id", "feed", "website", "updated",
        "text_content", "title", "url", "author","published", "extract_time"];

    let processor = function(data) {
        return pump.writeRow([data.id, data.feed, data.website, data.updated,
            data.text_content, data.title, data.url, data.author,data.published, data.extract_time]);
    };

    mongoClient.connect(url, function(err, db) {
        let adminDb = db.admin();
        adminDb.authenticate(username, password, function(err, result) {
            if(err) {
                console.error("authenticate err:", err);
                return 1;
            }

            let mongodbMixin = MongodbMixin(db);
            pump = pump.mixin(mongodbMixin);
            pump = pump.useCollection(collection);

            let stream = pump.find(condition, fields, options);
            console.log(stream);
            pump = pump.from(stream);

            let csvWriterMixin = CsvWriterMixin({path:outputFile, headers:headers});
            pump = pump.mixin(csvWriterMixin);

            pump.process(processor)
                .logErrorsToConsole()
                .run()
                .then(function() {
                    console.log("Done writing rss to file");
                    db.close();
                });
        });
    });
};
