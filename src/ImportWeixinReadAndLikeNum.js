'use strict';

let _ = require('lodash');
let cheerio = require('cheerio');
let co = require('co');
let Context = require('./common/Context');
let Constant = require('./execute/Constant');
let utils = require('./common/utils');
const redis = require('redis');
let config = require('config');

let hget = function (client, key, filed) {
    return new Promise((resolve, reject) => {
        client.hget(key, filed , (err, results) => {
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
        let client = redis.createClient(config.get(Constant.REDIS_IMPORT));
        let db = yield Context.get(Constant.REDIS_EXPORT);
        let collection = 'projects';

        let count = yield db.collection(collection).count(criteria);

        console.log(`Count ${count} ${type} projects.`);
        if (count == 0) {
            db.close();
            return
        }

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

            for (let project of projects) {
                let read_like_num = yield hget(client, "article_read_like",  project.id);
                console.log(`project ${ project.id },  read_like_num: ${ read_like_num }`);
                if (read_like_num) {
                    let read_like_num_obj = JSON.parse(read_like_num);
                    let like_num = read_like_num_obj.like_num;
                    let read_num = read_like_num_obj.read_num;

                    db.collection(collection).updateOne({ id: project.id }, { $set: { like_num: like_num, read_num: read_num } });
                    console.log(`> Update ${ project.id },  read_like_num: ${ read_like_num }`);
                }
            }
        }
        yield db.close();
        client.quit();

    }.bind(this)).catch(err => {
        console.log(err);
    });
};
