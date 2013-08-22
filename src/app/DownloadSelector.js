define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/Deferred',
        'dojo/on',

         'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',

        'dojo/text!app/templates/LeaderboardTemplate.html',
        'dojo/text!app/templates/LeaderBoardMiniTemplate.html',

        'esri/request'
    ],

    function(
        declare,
        lang,

        Deferred,
        on,

        _WidgetBase,
        _TemplatedMixin

        leaderboardTemplate,
        leaderBoardMiniTemplate,

        request
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.downloadSelector", [_WidgetBase, _TemplatedMixin], {
            baseClass: 'download-selector',

            // the data returned by the query to the url
            data: null,

            // the url to query for the leaderboard data
            url: null,

            //dropdown anchor link
            linkNode: null,

            //drowpdown content node
            contentNode: null,

            constructor: function() {
                console.log(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.log(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.displayCountySelection();
            },
            _setWizardAttr: {
                node: 'wizardNode',
                type: 'innerHTML'
            },
            displayCountySelection: function(){
                console.log(this.declaredClass + "::getLeaderboard", arguments);

                
            },
            getLeaderboard: function() {
                console.log(this.declaredClass + "::getLeaderboard", arguments);

                this.xhrDeferred = new dojo.Deferred();

                if (this.url) {
                    console.log('requesting data');
                    request({
                        url: this.url,
                        handleAs: "json",
                        callbackParamName: 'callback'
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

                this.data = json;

                if (this.data && this.data.standings) {
                    this.data.standings.sort(function(a, b) {
                        if (a.editCount > b.editCount)
                            return -1;
                        if (a.editCount < b.editCount)
                            return 1;
                        return 0;
                    });

                    this.data.standings = this.data.standings.slice(0, 3);
                    var places = ['gold', 'silver', 'bronze'],
                        counter = 0;
                    this.data.standingCss = function() {
                        // note that counter is in the enclosing scope
                        return places[counter++];
                    };
                }

                this.xhrDeferred.resolve({
                    mini: this.miniTemplate(this.data),
                    expanded: this.boardTemplate(this.data)
                });
            },
            onRequestFail: function(err) {
                // summary:
                //      fail callback for ajax request
                // err: Error
                console.log(this.declaredClass + "::onRequestFail", arguments);

                window.alert(err);
            }
        });
    });