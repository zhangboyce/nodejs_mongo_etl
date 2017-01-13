'use strict';

module.exports = {
    ExportRssProjects: require('./src/ExportRss').exportProjects,
    ExportRssWatchList: require('./src/ExportRss').exportWatchList,

    ExportWeixinWatchList: require('./src/ExportWeixin').exportWatchList,
    ExportWeixinProjects: require('./src/ExportWeixin').exportProjects,

    ExportInstagramWatchList: require('./src/ExportInstagram').exportWatchList,
    ExportInstagramProjects: require('./src/ExportInstagram').exportProjects,

    ExportFacebookWatchList: require('./src/ExportFacebook').exportWatchList,
    ExportFacebookProjects: require('./src/ExportFacebook').exportProjects,

    ExportTwitterWatchList: require('./src/ExportTwitter').exportWatchList,
    ExportTwitterProjects: require('./src/ExportTwitter').exportProjects,

    ExportWebsiteWatchList: require('./src/ExportWebsite').exportWatchList,
    ExportWebsiteProjects: require('./src/ExportWebsite').exportProjects,

    ImportProject2ES: require('./src/ImportEs').importProject,
    ImportFeedSource2ES: require('./src/ImportEs').importFeedSource,

    ImportWeixinReadAndLikeNum: require('./src/ImportWeixinReadAndLikeNum')

};