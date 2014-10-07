/* jshint unused:false */
(function() {
    var config = {
        baseUrl: (typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
        ) ? '/src' : './',
        packages: [
            'app',
            'agrc',
            'ijit',
            'dojo',
            'dijit',
            'esri',
            'dgrid',
            'put-selector',
            'xstyle', {
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            }, {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            }, {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
            }
        ]
    };
    require(config, [
        'jquery',

        'ijit/widgets/authentication/UserAdmin',

        'app/config',


        'dojo/domReady!'
    ], function(
        $,

        UserAdmin,

        config
    ) {
        new UserAdmin({
            title: 'Address Editing',
            appName: config.appName
        }, 'widget-div');
    });
})();