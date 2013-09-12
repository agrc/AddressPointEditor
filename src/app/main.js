require({
    async: 0
});

define([
        'dojo/parser',

        'jquery/jquery',
        'bootstrap/js/bootstrap',
        'app/App'
    ],

    function(parser) {
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
                leaderboard: './webapi/api/leaderboard',
                basemap: 'http://mapserv.utah.gov/ArcGIS/rest/services/UtahBaseMap-Vector/MapServer',
                featureLayer: "/arcgis/rest/services/Broadband/Editing/FeatureServer/",
                geometryService: "/arcgis/rest/services/Geometry/GeometryServer",
                downloadGp: "/arcgis/rest/services/Broadband/DownloadTool/GPServer/Download%20Address%20Points"
            }
        };

        parser.parse();
    });