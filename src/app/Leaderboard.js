define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/Deferred',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/Leaderboard.html',
        'dojo/text!app/templates/LeaderboardTemplate.html',
        'dojo/text!app/templates/LeaderItemTemplate.html',
        'dojo/text!app/templates/LeaderBoardMiniTemplate.html',

        'mustache/mustache',

        'esri/request'
    ],

    function(
        declare,
        lang,

        Deferred,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        template,
        leaderboardTemplate,
        leaderboardItemTemplate,
        leaderBoardMiniTemplate,

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
                this.miniTemplate = mustache.compile(leaderBoardMiniTemplate);

                this.wireEvents();

                this.getLeaderboard().then(lang.hitch(this,
                    function(content) {
                        this.set('containerDiv', content);
                    }));
            },
            _setContainerDivAttr: {
                node: 'containerDiv',
                type: 'innerHTML'
            },
            getLeaderboard: function() {
                console.log(this.declaredClass + "::getLeaderboard", arguments);

                this.xhrDeferred = new dojo.Deferred();

                if (this.url) {
                    console.log('requesting data');
                    request({
                        url: this.url,
                        handleAs: "json"
                    }).then(lang.hitch(this, this.onRequestComplete),
                        lang.hitch(this, this.onRequestFail));

                    return this.xhrDeferred;
                }

                this.onRequestComplete(this.data);

                return this.xhrDeferred;
            },
            onRequestComplete: function(json) {
                // summary:
                //      callback for request
                // json: Object
                console.log(this.declaredClass + "::onRequestComplete", arguments);
                this.miniView = this.miniTemplate(json);
                this.expandedView = this.boardTemplate(json);

                this.xhrDeferred.resolve(this.miniView);
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