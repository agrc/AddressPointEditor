define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/Leaderboard.html',
        'dojo/text!app/templates/LeaderboardTemplate.html',
        'dojo/text!app/templates/LeaderItemTemplate.html',

        'mustache/mustache',

        'esri/request'
    ],

    function(
        declare,
        lang,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        template,
        leaderboardTemplate,
        leaderboardItemTemplate,

        mustache,

        request
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.leaderboard", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            widgetsInTemplate: true,
            templateString: template,
            baseClass: 'leaderboard',

            // the data returned by the query to the url
            data: null,

            // the url to query for the leaderboard data
            url: null,

            constructor: function() {
                console.log(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.log(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.boardTemplate = mustache.compile(leaderboardTemplate);
                this.boardItem = mustache.compile(leaderboardItemTemplate);

                this.wireEvents();

                if (this.url) {
                    request(this.url, {
                        //jsonp: 'callback'
                    });
                    //.then(lang.hitch(this, this.onRequestComplete), lang.hitch(this, this.onRequestFail));

                    return;
                }
                 
                this.onRequestComplete(this.data);
            },
            onRequestComplete: function(json) {
                // summary:
                //      callback for request
                // json: Object
                console.log(this.declaredClass + "::onRequestComplete", arguments);

                this.boardTemplate(json);
            },
            onRequestFail: function(err) {
                // summary:
                //      fail callback for ajax request
                // err: Error
                console.log(this.declaredClass + "::onRequestFail", arguments);

                window.alert(err);
            },
            wireEvents: function() {
                // param: type or return: type
                console.log(this.declaredClass + "::wireEvents", arguments);

            },
            show: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::show", arguments);

            },
            hide: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::hide", arguments);

            }
        });
    });