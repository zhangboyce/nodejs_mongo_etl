'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let co = require('co');
let Constant = require('./execute/Constant');
let utils = require('./common/utils');
let redis = require('redis');
let config = require('config');
let ConnectMongo = require('./common/ConnectMongo');

let hget = function (client, key, filed) {
    return new Promise((resolve, reject) => {
        client.hget(key, filed , (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

let hmget = function (client, key, fileds) {
    return new Promise((resolve, reject) => {
        client.hmget(key, fileds , (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};




module.exports =  options => {
    let hours = options.hours;
    let range = options.range;
    let type = options.type;

    let criteria = _.assign(utils.criteria(hours), {type: type});
    let fields = { id: 1};

    co(function* () {
        let client, db;
        try {
            client = redis.createClient(config.get(Constant.REDIS_IMPORT));
            db = yield ConnectMongo(config.get(Constant.REDIS_EXPORT));

            let collection = 'projects';
            let count = yield db.collection(collection).count(criteria);

            console.log(`Count ${count} ${type} projects.`);
            if (count != 0) {
                // init first query condition
                let condition = utils.mergeCriteria(criteria);
                let step = Math.floor(count / range) + 1;
                let completed = 0;

                for (let i = 0; i < step; i++) {
                    let cursor = db.collection(collection).find(condition, fields).sort({_id: 1}).limit(range);
                    let projects = yield cursor.toArray();

                    console.log(`Query ${projects.length} ${type} projects (completed=${range * i + projects.length}, count=${count}), condition: ${JSON.stringify(condition)}`);
                    if (projects.length == 0) continue;

                    // update the next query condition, get the last result's _id
                    let lastId = projects[projects.length - 1]._id;
                    condition = utils.mergeCriteria(condition, lastId);

                    let pids = _.map(projects, project => project.id);
                    let read_like_nums = yield hmget(client, "article_read_like",  pids);

                    if (!read_like_nums || read_like_nums.length == 0) continue;

                    let bulk = db.collection(collection).initializeUnorderedBulkOp({useLegacyOps: true});
                    for (let j=0; j<pids.length; j++) {
                        let read_like_num = read_like_nums[j];
                        if (read_like_num) {
                            let read_like_num_obj = JSON.parse(read_like_num);
                            let like_num = read_like_num_obj.like_num;
                            let read_num = read_like_num_obj.read_num;

                            bulk.find({ id: pids[j] }).upsert().updateOne({ $set: { like_num: like_num, read_num: read_num } });
                        }
                    }

                    if (bulk.length != 0) {
                        let result = yield bulk.execute();
                        console.log(`Upserted ${ bulk.length } ${ type } project's read-like num.`);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
        db && db.close();
        client && client.quit();

    }.bind(this));
};
