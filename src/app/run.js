(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, "") + '/';

        // running in unit tests
        projectUrl = (projectUrl === "/") ? '/src/' : projectUrl;
    } else {
        // running in build system
        projectUrl = '';
    }
    var config = {packagePaths: {}};
    config.packagePaths[projectUrl] = [
        'app',
        'agrc',
        'ijit',
        'mustache',
        'jquery',
        'bootstrap'
    ];
    require(config, ['app']);
})();