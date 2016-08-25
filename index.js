'use strict';

module.exports = {
  ExportRssProjects: require('./lib/ExportRss').exportRssProjects,
  ExportRssWatchList: require('./lib/ExportRss').exportRssWatchList,

  ExportWeixinWatchList: require('./lib/ExportWeixin').exportWeixinWatchList,
  ExportWeixinProjects: require('./lib/ExportWeixin').exportWeixinProjects,

  ExportInstagramWatchList: require('./lib/ExportInstagram').exportInstagramWatchList,
  ExportInstagramProjects: require('./lib/ExportInstagram').exportInstagramProjects
};