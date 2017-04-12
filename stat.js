#!/usr/bin/env node
'use strict';

let ConnectMongo = require('./src/common/ConnectMongo');
let co = require('co');
let raw_url = 'mongodb://raw:raw@dds-bp17568c88318c341.mongodb.rds.aliyuncs.com:3717/raw';
let boom_url = 'mongodb://boom:boom@dds-bp13d9353a884c541.mongodb.rds.aliyuncs.com:3717/boom';

let FACEBOOK = 'facebook',
    INSTAGRAM = 'instagram',
    RSS = 'rss',
    TWITTER='twitter',
    WEBSITE='website',
    WEIXIN='weixin';

let types = [FACEBOOK, INSTAGRAM, RSS, TWITTER, WEBSITE, WEIXIN];
let type_collection = {
    'facebook': {
        watchlist: 'facebook_watchlist',
        project: 'facebook'
    },
    'instagram': {
        watchlist: 'instagram_watchlist',
        project: 'instagram'
    },
    'rss': {
        watchlist: 'rss_watchlist',
        project: 'rss'
    },
    'twitter': {
        watchlist: 'twitter_watchlist',
        project: 'twitter'
    },
    'website': {
        watchlist: 'website_watchlist',
        project: 'website'
    },
    'weixin': {
        watchlist: 'weixin_watchlist',
        project: 'weixin_article_list'
    }
};

let type_filed = {
    'facebook': ['id', 'name'],
    'instagram': ['id', 'full_name'],
    'rss': ['feed', 'title'],
    'twitter': ['id', 'name'],
    'website': ['link', 'title'],
    'weixin': ['biz', 'nickname']
};

let type_relation = {
    'facebook': 'from.id',
    'instagram': 'owner.id',
    'rss': 'feed',
    'twitter': 'user.id',
    'website': 'website',
    'weixin': 'biz'
};

co(function* () {
    let raw_db, boom_db;
    try {
        let args = process.argv.slice(2);
        let type = args[0];
        if (!type_collection[type]) {
            console.log(`Illegal type[${ type }], given:  ${ types.join(', ') }`);
            return;
        }

        raw_db = yield ConnectMongo(raw_url);
        boom_db = yield ConnectMongo(boom_url);

        let raw_watchlist_collection = raw_db.collection(type_collection[type].watchlist);
        let raw_project_collection = raw_db.collection(type_collection[type].project);

        let boom_watchlist_collection = boom_db.collection('feedsources');
        let boom_project_collection = boom_db.collection('projects');

        let field = { _id: 0 };
        let tf = type_filed[type];
        if (tf && tf.length != 0) {
            tf.forEach(e => { field[e] = 1 });
        }

        let raw_watchlist = yield raw_watchlist_collection.find({}, field).toArray();
        let boom_watchlist = yield boom_watchlist_collection.find({ type: type }, { _id: 1, originId: 1 }).toArray();

        if (raw_watchlist.length == 0) {
            console.log(`${ type } watchlist is 0.`);
            return;
        }

        let type_filed_id = type_filed[type][0];
        let type_filed_name = type_filed[type][1];
        for (let w of raw_watchlist) {
            let condition = { };
            condition[type_relation[type]] = w[type_filed_id];
            let raw_project_count = yield raw_project_collection.count(condition);

            let boom_project_count = 'null';
            let index = boom_watchlist.findIndex(bw => bw.originId == type + '/' + w[type_filed_id]);
            if (index != -1) {
                boom_project_count = yield boom_project_collection.count({ feed: boom_watchlist[index]._id.toHexString() });
            }

            let result = {};
            result.type = type;
            result[type_filed_id] = w[type_filed_id];
            result[type_filed_name] = w[type_filed_name];
            result['raw_project_count'] = raw_project_count;
            result['boom_project_count'] = boom_project_count;

            console.log(JSON.stringify(result));
        }

        console.log(`${ type } watchlist count: ${ raw_watchlist.length }`);

    } catch(e) {
        console.log(e);
    }

    raw_db && raw_db.close();
    boom_db && boom_db.close();
}.bind(this));

