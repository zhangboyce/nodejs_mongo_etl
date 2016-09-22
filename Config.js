'use strict';

exports.mongo_config = {
    export_content_url: 'mongodb://contentpool:contentpool@' +
    'dds-bp17568c88318c341.mongodb.rds.aliyuncs.com:3717,' +
    'dds-bp17568c88318c342.mongodb.rds.aliyuncs.com:3717/contentpool?' +
    'replicaSet=mgset-1471849',

    export_raw_url: 'mongodb://raw:raw@' +
    'dds-bp17568c88318c341.mongodb.rds.aliyuncs.com:3717,' +
    'dds-bp17568c88318c342.mongodb.rds.aliyuncs.com:3717/raw?' +
    'replicaSet=mgset-1471849',

    import_url: 'mongodb://192.168.100.83:27017/boom'
};

exports.es_etl_config = {
    es: {
        host: '192.168.100.83:9200',
        log: 'info'
    },
    mongo: {
        url: 'mongodb://192.168.100.83:27017/boom'
    }
};