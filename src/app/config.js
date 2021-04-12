define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/config'
], function (
    has,
    xhr,

    esriConfig
) {
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('basemaps.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');

    window.AGRC = {
        // app: app.App
        //      global reference to App
        app: null,

        // version.: String
        //      The version number.
        version: '2.0.0',

        //apiKey: String
        apiKey: null,

        appName: 'addressediting',

        // cache level 13
        labelsMinScale: 2257,

        parcelsMinScale: 10000,

        urls: {
            editLayer: '/arcgis/rest/services/AddressEditor/Editing/FeatureServer/',
            viewLayer: '/arcgis/rest/services/AddressEditor/Viewing/FeatureServer/',
            geometryService: '/arcgis/rest/services/Geometry/GeometryServer',
            downloadGp: '/arcgis/rest/services/AddressEditor/DownloadTool/GPServer/Download%20Address%20Points',
            redline: null,
            parcelsService: 'https://tiles.arcgis.com/tiles/99lidPhWCzftIe9K/arcgis/rest/services/StatewideParcels/VectorTileServer'
        },

        fieldNames: {
            Editor: 'Editor',
            ModifyDate: 'ModifyDate',
            FullAddress: 'FullAdd'
        }
    };

    if (has('agrc-api-key') === 'prod') {
        // addressediting.utah.gov
        window.AGRC.apiKey = 'AGRC-7D48DD3D449390';
        window.AGRC.urls.redline = 'https://mapserv.utah.gov/chalkdust';
        window.AGRC.quadWord = 'panther-avatar-neutral-grille'
    } else if (has('agrc-api-key') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-FFCDAD6B933051';
        window.AGRC.urls.redline = 'https://test.mapserv.utah.gov/chalkdust';
        window.AGRC.quadWord = 'opera-event-little-pinball';
    } else {
        window.AGRC.urls.redline = 'https://mapserv.utah.gov/chalkdust';
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            window.AGRC.quadWord = secrets.quadWord;
            window.AGRC.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    return window.AGRC;
});
