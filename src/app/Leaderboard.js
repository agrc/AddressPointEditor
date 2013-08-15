define([
        'dojo/_base/declare',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/Leaderboard.html',
        'dojo/text!app/templates/LeaderboardTemplate.html',
        'dojo/text!app/templates/LeaderItemTemplate.html',

        'mustache/mustache'
    ],

    function(
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template,
        leaderboardTemplate,
        leaderboardItemTemplate,
        mustache
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.leaderboard", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            widgetsInTemplate: true,
            templateString: template,
            baseClass: 'leaderboard',

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