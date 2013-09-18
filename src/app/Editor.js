define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/topic',
        'dojo/aspect',
        'dojo/on',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dijit/Tooltip',

        'dojo/text!app/templates/Editor.html',
        'dojo/i18n!esri/nls/jsapi', //this is where esri.bundle is located

        'esri/undoManager',
        'esri/toolbars/draw',
        'esri/graphic',
        'esri/tasks/query',
        'esri/toolbars/edit'
    ],

    function(
        declare,
        lang,

        topic,
        aspect,
        on,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        Tooltip,

        template,
        jsapiBundle, 

        UndoManager,
        Draw,
        Graphic,
        Query,
        Edit
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

            //editingToolbar: esri/toolbars/edit
            editingToolbar: null,

            //boolean: flag for knowing to start/finish editing session
            isEditing: null,

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

                jsapiBundle.toolbars.draw.addPoint = 'Click on the map to place your new address point.';

                this.drawingToolbar = new Draw(this.map);

                this.isEditing = false;

                this.editingToolbar = new Edit(this.map);

                this.wireEvents();
            },
            wireEvents: function() {
                // summary:
                //      sets up the events for this widget
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.drawingToolbar.on("draw-end", lang.hitch(this, 'saveNewPoint'));

                this.own(
                    aspect.after(this.drawingToolbar, 'deactivate', function() {
                        topic.publish('app/toolbar', 'navigation');
                    }),
                    aspect.after(this.drawingToolbar, 'activate', function() {
                        topic.publish('app/toolbar', 'drawing');
                    }),
                    aspect.after(this.editingToolbar, 'deactivate', function() {
                        topic.publish('app/toolbar', 'navigation');
                    }),
                    aspect.after(this.editingToolbar, 'activate', function() {
                        topic.publish('app/toolbar', 'editing');
                    })
                );

                this.own(
                    this.editingToolbar.on("deactivate", lang.hitch(this,
                        function(evt) {
                            console.log('editingToolbar::deactivate::saving edits');
                            this.editLayer.applyEdits(null, [evt.graphic], null);
                        }))
                );
            },
            saveNewPoint: function(evt) {
                // summary:
                //      applies the edits to the feature layer
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.isActive = false;
                this.drawingToolbar.deactivate();
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
                    this.drawingToolbar.deactivate();
                    return;
                }

                this.isActive = true;
                this.drawingToolbar.activate(Draw.POINT);
            },
            activateEditing: function(evt) {
                // summary:
                //      sets up the evetns on the layer
                // layer: the layer added to the map that is going to be edited
                console.log(this.declaredClass + "::activateEditing", arguments);

                if(this.editingSignal){
                    this.editingToolbar.deactivate();
                    this.editingSignal.remove();
                    this.editingSignal = null;
                    return;
                }

                this.own(
                    this.editingSignal = this.editLayer.on('mouse-over', lang.hitch(this,
                        function(evt) {
                            console.log('editingLayer::mouse-over');
                            // if (this.isEditing === false) {
                            //     console.log('editingToolbar::active');
                            if (this.editingGraphic !== evt.graphic) {
                                this.editingToolbar.deactivate();
                                this.editingToolbar.activate(Edit.MOVE, evt.graphic);
                                this.editingGraphic = evt.graphic;
                            }

                            // } 
                            // else {
                            //     this.editingToolbar.deactivate();
                            //     console.log('editingToolbar::deactivating');
                            // }
                        }))
                );


            }
        });
    });
