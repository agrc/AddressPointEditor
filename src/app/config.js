define([
    'dojo/has'
], function(
    has
    ) {
    var apiKey, redlineUrl;

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        apiKey = 'AGRC-E7FEB434755864';
        redlineUrl = 'http://mapserv.utah.gov/chalkdust';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        apiKey = 'AGRC-FFCDAD6B933051';
        redlineUrl = 'http://test.mapserv.utah.gov/chalkdust';
    } else {
        // localhost
        apiKey = 'AGRC-B5D62BD2151902';
        redlineUrl = 'http://localhost/git/chalkdust/dist/';
    }

    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '1.0.0',

        //apiKey: 'AGRC-B5D62BD2151902', // localhost
        apiKey: apiKey,

        appName: 'addressediting',

        urls: {
            basemap: 'http://mapserv.utah.gov/ArcGIS/rest/services/BaseMaps/Vector/MapServer',
            editLayer: '/arcgis/rest/services/Broadband/Editing/FeatureServer/',
            viewLayer:  '/arcgis/rest/services/Broadband/Viewing/MapServer/',
            geometryService: '/arcgis/rest/services/Geometry/GeometryServer',
            downloadGp: '/arcgis/rest/services/Broadband/DownloadTool/GPServer/Download%20Address%20Points',
            redline: redlineUrl
        },

        fieldNames: {
            Editor: 'Editor',
            ModifyDate: 'ModifyDate'
        }
    };

    return window.AGRC;
});