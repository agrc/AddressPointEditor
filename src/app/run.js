((function () {
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
        ) ? '/src' : './',
        packages: [
            'agrc',
            'app',
            'dgauges',
            'dgrid',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'layer-selector',
            'moment',
            'put-selector',
            'xstyle',
            {
                name: 'highcharts',
                location: './highcharts-release',
                main: 'highcharts'
            },{
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            },{
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            },{
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            },{
                name: 'mustache',
                location: './mustache',
                main: 'mustache'
            },{
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            },{
                name: 'stubmodule',
                location: './stubmodule',
                main: 'src/stub-module'
            }
        ],
        map: {
            'app/AttributeEditor': {
                'esri/dijit/AttributeInspector':
                'app/patch/AttributeInspector'
            }
        }
    };
    require(config, ['dojo/parser', 'jquery', 'dojo/domReady!'], function (parser) {
        parser.parse();
    });
})());
