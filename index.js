'use strict';

module.exports = {
  ExportRssProjects: require('./lib/ExportRss').exportProjects,
  ExportRssWatchList: require('./lib/ExportRss').exportWatchList,

  ExportWeixinWatchList: require('./lib/ExportWeixin').exportWatchList,
  ExportWeixinProjects: require('./lib/ExportWeixin').exportProjects,

  ExportInstagramWatchList: require('./lib/ExportInstagram').exportWatchList,
  ExportInstagramProjects: require('./lib/ExportInstagram').exportProjects,

  ExportFacebookWatchList: require('./lib/ExportFacebook').exportWatchList,
  ExportFacebookProjects: require('./lib/ExportFacebook').exportProjects,

  ExportTwitterWatchList: require('./lib/ExportTwitter').exportWatchList,
  ExportTwitterProjects: require('./lib/ExportTwitter').exportProjects,

  ExportWebsiteWatchList: require('./lib/ExportWebsite').exportWatchList,
  ExportWebsiteProjects: require('./lib/ExportWebsite').exportProjects,

  ImportProject2ES: require('./lib/Import2ES').importProject,
  ImportFeedSource2ES: require('./lib/Import2ES').importFeedSource
};