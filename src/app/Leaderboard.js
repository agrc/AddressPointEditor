define([
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/Deferred',

    'dijit/_WidgetBase',

    'dojo/text!./templates/LeaderboardTemplate.html',
    'dojo/text!./templates/LeaderboardMiniTemplate.html',

    'mustache',

    'esri/request'
], function (
    declare,
    lang,

    Deferred,

    _WidgetBase,

    leaderboardTemplate,
    leaderBoardMiniTemplate,

    mustache,

    request
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase], {
        baseClass: 'leaderboard',

        // the data returned by the query to the url
        data: null,

        // the url to query for the leaderboard data
        url: null,

        //dropdown anchor link
        linkNode: null,

        //drowpdown content node
        contentNode: null,

        constructor: function () {
            console.log('app.leaderboard::constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app.leaderboard::postCreate', arguments);

            this.inherited(arguments);

            this.boardTemplate = mustache.compile(leaderboardTemplate);
            this.miniTemplate = mustache.compile(leaderBoardMiniTemplate);

            this.getLeaderboard().then(lang.hitch(this,
                function (content) {
                    this.set('link', content.mini);
                    this.set('dropdown', content.expanded);
                }));
        },
        _setLinkAttr: {
            node: 'linkNode',
            type: 'innerHTML'
        },
        _setDropdownAttr: {
            node: 'contentNode',
            type: 'innerHTML'
        },
        getLeaderboard: function () {
            console.log('app.leaderboard::getLeaderboard', arguments);

            this.xhrDeferred = new Deferred();

            if (this.url) {
                request({
                    url: this.url,
                    handleAs: 'json',
                    callbackParamName: 'callback'
                }).then(lang.hitch(this, this.onRequestComplete),
                    lang.hitch(this, this.onRequestFail));

                return this.xhrDeferred;
            }

            this.onRequestComplete(this.data);

            return this.xhrDeferred;
        },
        onRequestComplete: function (json) {
            // summary:
            //      callback for request
            // json: Object
            console.log('app.leaderboard::onRequestComplete', arguments);

            this.data = json;

            if (this.data && this.data.standings) {
                this.data.standings.sort(function (a, b) {
                    if (a.editCount > b.editCount) {
                        return -1;
                    }
                    if (a.editCount < b.editCount) {
                        return 1;
                    }
                    return 0;
                });

                this.data.standings = this.data.standings.slice(0, 3);
                var places = ['gold', 'silver', 'bronze'];
                var counter = 0;
                this.data.standingCss = function () {
                    // note that counter is in the enclosing scope
                    return places[counter++];
                };
            }

            this.xhrDeferred.resolve({
                mini: this.miniTemplate(this.data),
                expanded: this.boardTemplate(this.data)
            });
        },
        onRequestFail: function (err) {
            // summary:
            //      fail callback for ajax request
            // err: Error
            console.log('app.leaderboard::onRequestFail', arguments);

            window.alert(err);
        }
    });
});
