'use strict';

module.exports = {
  ExportRss: require('./lib/ExportRss'),

  ExportWeixinWatchList: require('./lib/ExportWeixin').exportWeixinWatchList,
  ExportWeixinProjects: require('./lib/ExportWeixin').exportWeixinProjects
};