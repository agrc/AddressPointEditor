define([
        'dojo/parser',

        'app/App'
    ],

    function(
        parser
    ) {
        window.AGRC = {
            // errorLogger: ijit.modules.ErrorLogger
            errorLogger: null,

            // app: app.App
            //      global reference to App
            app: null,

            // version: String
            //      The version number.
            version: '0.1.0',

            apiKey: 'AGRC-B5D62BD2151902' // localhost
        };

        // lights...camera...action!
        parser.parse();
    });