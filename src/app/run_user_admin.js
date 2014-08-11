(function() {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, '');

        // running in unit tests
        projectUrl = (projectUrl === '/') ? '/src/' : projectUrl;
    } else {
        // running in build system
        projectUrl = '';
    }
    var config = {
        packagePaths: {},
        packages: [{
            name: 'bootstrap',
            location: projectUrl + '/bootstrap/dist',
            main: 'js/bootstrap'
        }, {
            name: 'jquery',
            location: projectUrl + '/jquery/dist',
            main: 'jquery'
        }]
    };
    config.packagePaths[projectUrl] = [
        'app',
        'agrc',
        'ijit',
        'dojo',
        'dijit'
    ];
    require(config, [
            'ijit/widgets/authentication/UserAdmin',

            'dojo/domReady!'
        ],

        function(
            UserAdmin
        ) {
            new UserAdmin({
                title: 'Address Editing',
                appName: 'addressediting'
            }, 'widget-div');
        });
})();