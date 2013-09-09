define([
        'dojo/_base/declare',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/Editor.html',

        'esri/undoManager'
    ],

    function(
        declare,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        template,

        UndoManager
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.editor", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            baseClass: 'editor-panel',

            widgetsInTemplate: true,

            templateString: template,

            constructor: function() {
                console.info(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.undoManager = new UndoManager({maxOperations: 5});
            }
        });
    });