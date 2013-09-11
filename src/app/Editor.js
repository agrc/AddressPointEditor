define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/topic',
        'dojo/aspect',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dijit/Tooltip',

        'dojo/text!app/templates/Editor.html',

        'esri/undoManager',
        'esri/toolbars/draw',
        'esri/graphic',
        'esri/tasks/query'
    ],

    function(
        declare,
        lang,

        topic,
        aspect,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        Tooltip,

        template,

        UndoManager,
        Draw,
        Graphic,
        Query
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.editor", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            baseClass: 'editor-panel',

            widgetsInTemplate: true,

            templateString: template,

            //drawing: esri/toolbars/draw

            //isActive: boolean for knowing when drawing toolbar is active. 
            //          allows for point button to be clicked twice to disable
            isActive: false,

            constructor: function() {
                console.info(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.undoManager = new UndoManager({
                    maxOperations: 5
                });

                new Tooltip({
                    connectId: [this.pointButton],
                    label: "Add address points to the map."
                });

                new Tooltip({
                    connectId: [this.undo],
                    label: "Make a mistake? Undo the last editing action."
                });

                new Tooltip({
                    connectId: [this.redo],
                    label: "Redo the last editing action."
                });

                esri.bundle.toolbars.draw.addPoint = 'Click on the map to place your new address point.';

                this.drawing = new Draw(this.map);

                this.wireEvents();
            },
            wireEvents: function() {
                // summary:
                //      sets up the events for this widget
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.drawing.on("draw-end", lang.hitch(this, 'saveNewPoint'));

                this.own(
                    aspect.after(this.drawing, 'deactivate', function() {
                        topic.publish('app/toolbar', 'navigation');
                    }),
                    aspect.after(this.drawing, 'activate', function() {
                        topic.publish('app/toolbar', 'drawing');
                    })
                );
            },
            saveNewPoint: function(evt) {
                // summary:
                //      applies the edits to the feature layer
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.isActive = false;
                this.drawing.deactivate();
                this.editLayer.clearSelection();

                this.map.showLoader();

                var newGraphic = new Graphic(evt.geometry, null, null);

                var selectQuery = new Query();
                selectQuery.geometry = evt.geometry;

                this.editLayer.applyEdits([newGraphic], null, null).then(lang.hitch(this,
                    function() {
                        topic.publish('app/selectFeature', selectQuery);
                        this.map.hideLoader();
                    }));
            },
            activatePointDrawing: function() {
                // summary:
                //      enables the toolbar to edit points
                console.log(this.declaredClass + "::activatePointDrawing", arguments);

                if (this.isActive) {
                    this.drawing.deactivate();
                    return;
                }

                this.isActive = true;
                this.drawing.activate(Draw.POINT);
            }
        });
    });
