define(['dojo/has'], function(has) {
    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '0.1.0',

        //apiKey: 'AGRC-B5D62BD2151902', // localhost
        apiKey: 'AGRC-FFCDAD6B933051',

        urls: {
            basemap: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Vector/MapServer',
            featureLayer: '/arcgis/rest/services/Broadband/Editing/FeatureServer/',
            geometryService: '/arcgis/rest/services/Geometry/GeometryServer',
            downloadGp: '/arcgis/rest/services/Broadband/DownloadTool/GPServer/Download%20Address%20Points'
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-E7FEB434755864';
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-FFCDAD6B933051';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-B5D62BD2151902';
    }

    return window.AGRC;
});