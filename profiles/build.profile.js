/*eslint-disable no-unused-vars*/

var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'app/App',
                'dojox/gfx/filters',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'dojox/gfx/shape',
                'ladda/dist/spin'
            ],
            targetStylesheet: 'app/resources/App.css',
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        },
        'app/run_user_admin': {
            include: [
                'app/run_user_admin'
            ],
            exclude: ['dojo/dojo']
        }
    },
    packages: ['dgrid1', 'dstore', {
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
           // don't bother with .hidden, tests, min, src, and templates
           ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function (filename, mid) {
                return /\.js$/.test(filename);
            }
        }
    }],
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api': 0,
        'dojo-log-api': 0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates': 0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader': 0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory': 0,

        // We aren’t loading tests in production
        'dojo-test-sniff': 0
    },
    plugins: {
        'xstyle/css': 'xstyle/build/amd-css'
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector']
    },
    map: {
        'app/AttributeEditor': {
            'esri/dijit/AttributeInspector':
            'app/patch/AttributeInspector'
        }
    }
};
