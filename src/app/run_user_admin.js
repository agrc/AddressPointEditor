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
        },{
                name: 'spin',
                location: projectUrl + '/spinjs',
                main: 'spin'
            },{
                name: 'ladda',
                location: projectUrl + '/ladda-bootstrap/dist',
                main: 'ladda'
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