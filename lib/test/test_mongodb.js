'use strict';

let co = require('co');
let _ = require('lodash');
let ObjectID = require('mongodb').ObjectID;
let MongoClient = require('mongodb').MongoClient;

let url = 'mongodb://localhost:27017/test';

MongoClient.connect(url, function(err, db) {
    co(function *() {
        yield insertBatch(db, 500000);
    });
});

function* insertBatch(db, num) {
    let start = new Date().getTime();
    console.log(start);

    let batch = db.collection('restaurants').initializeUnorderedBulkOp({useLegacyOps: true});
    for (let i=0; i<num; i++) {
        let document = yield getDocument(i);
        batch.insert(document);
        console.log("Inserted a document into the restaurants collection.");
    }
    yield batch.execute();

    console.log('competed and take: ' + (new Date().getTime() - start) + 'ms.');
    db.close();
}

// 473202ms
// 45114ms
function* insertOneByOne(db, num) {
    let start = new Date().getTime();
    console.log(start);

    for (let i=0; i<num; i++) {
        let document = yield getDocument(i);
        yield db.collection('restaurants').insertOne(document);
        console.log("Inserted a document into the restaurants collection.");
    }

    console.log('competed and take: ' + (new Date().getTime() - start) + 'ms.');
    db.close();
}

function* getDocument(i) {
    return {
        "address" : {
            "street" : "2 Avenue",
            "zipcode" : "10075",
            "building" : "1480",
            "coord" : [ -73.9557413, 40.7720266 ]
        },
        "borough" : "Manhattan",
        "cuisine" : "Italian",
        "grades" : [
            {
                "date" : new Date("2014-10-01T00:00:00Z"),
                "grade" : "A",
                "score" : Math.random() * (100 - 1) + 1
            },
            {
                "date" : new Date("2014-01-16T00:00:00Z"),
                "grade" : "B",
                "score" : Math.random() * (100 - 1) + 1
            }
        ],
        "name" : "Vella",
        "restaurant_id" : i
    }
}

