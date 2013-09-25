define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/Color',
        'dojo/_base/json',

        'dojo/topic',
        'dojo/aspect',
        'dojo/on',
        'dojo/dom-class',

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
        'esri/toolbars/edit',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/dijit/editing/Add',
        'esri/dijit/editing/Delete',
        'esri/dijit/editing/Update'
    ],

    function(
        declare,
        lang,
        Color,
        dojo,

        topic,
        aspect,
        on,
        domClass,

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
        Edit,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Add,
        Delete,
        Update
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.editor", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            baseClass: 'editor-panel',

            widgetsInTemplate: true,

            templateString: template,

            // attribute maps
            undoCount: 0,
            _setUndoCountAttr: { node: 'undoCountSpan', type: 'innerHTML'},

            redoCount: 0,
            _setRedoCountAttr: { node: 'redoCountSpan', type: 'innerHTML'},

            //drawingToolbar: esri/toolbars/draw: the toolbar used to add new points

            //boolean: for knowing when drawing toolbar is active. 
            //          allows for point button to be clicked twice to disable
            isDrawing: false,

            //esri/toolbars/edit: the toolbar controlling editing of the editLayer
            editingToolbar: null,

            //esri/layers/FeatureLayer: the feature layer being edited
            editLayer: null,

            //boolean: flag for knowing to start/finish editing session
            isEditing: null,

            //esri/Graphic: the graphic being edited. Holds the new location if being moved.
            updatedGraphic: null,

            //esri/Graphic: the original state of the updatedGraphic. Necessary for preUpdate on undomanager
            originalGraphic: null,

            //esri/Grahpic: the graphic to be displayed when adding a new point and waiting for the edit layer to draw it
            newGraphic: null,

            //dojo/event
            editingSignal: null,

            //esri/symbols/simplemarkersymbol: the color to make selected points for editing
            symbol: null,

            //esri/undomanager: the tool for enabling undo/redo
            undoManager: null,

            //moveText: domNode: the text displayed for starting and stopping editing points

            //hash: holds the edits as a key value pair with the objectid being the key and the 
            //      value being original graphic and the moved graphic
            editSession: null,

            _setMoveTextAttr: {
                node: 'moveTextNode',
                type: 'innerHTML'
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.editSession = {};

                this.symbol = new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color("black"), 1),
                    new Color("yellow")
                );

                this.undoManager = new UndoManager({
                    maxOperations: 5
                });

                new Tooltip({
                    connectId: [this.pointButton],
                    label: "Add address points to the map."
                });

                new Tooltip({
                    connectId: [this.moveButton],
                    label: "Enable moving of address points on the map. Hover over a point, then drag to move it."
                });

                new Tooltip({
                    connectId: [this.undoNode],
                    label: "Make a mistake? Undo the last editing action."
                });

                new Tooltip({
                    connectId: [this.redoNode],
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

                //This assists the application to know what toolbar is active.
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

                //Prelogic for activateEditing.
                this.own(
                    aspect.before(this, 'activateEditing', function() {
                        this.drawingToolbar.deactivate();
                    })
                );

                this.own(
                    this.drawingToolbar.on("draw-end", lang.hitch(this, 'saveNewPoint')),

                    //Prelogic for saveNewPoint
                    aspect.before(this, 'saveNewPoint', function() {
                        this.isDrawing = false;
                        this.drawingToolbar.deactivate();
                        this.editLayer.clearSelection();

                        topic.publish('map-activity', 1);
                    })
                );

                this.own(
                    on(this.undoNode, 'click', lang.hitch(this, 'undo')),
                    on(this.redoNode, 'click', lang.hitch(this, 'redo')),

                    topic.subscribe('app/operation-edit', lang.hitch(this, 'addUndoState'))
                );

                //When editing toolbar is deactivated, save edits. 
                //Probably not a great idea.
                this.own(
                    this.editingToolbar.on("deactivate", lang.hitch(this, 'saveEdits'))
                );
            },
            saveNewPoint: function(evt) {
                // summary:
                //      applies the edits to the feature layer
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.newGraphic = new Graphic(evt.geometry, this.symbol, null, null);
                this.map.graphics.add(this.newGraphic);

                var selectQuery = new Query();
                selectQuery.geometry = evt.geometry;

                topic.publish('app/operation-edit', ['add', this.newGraphic]);

                this.editLayer.applyEdits([this.newGraphic], null, null)
                    .then(lang.hitch(this,
                        function() {
                            topic.publish('app/selectFeature', selectQuery);
                        },
                        function() {
                            topic.publish('app/state', 'Unable to save new point.');
                        }))
                    .always(lang.hitch(this,
                        function() {
                            topic.publish('map-activity', -1);
                            this.map.graphics.remove(this.newGraphic);
                            this.newGraphic = null;
                        }));
            },
            activatePointDrawing: function() {
                // summary:
                //      enables the toolbar to edit points
                console.log(this.declaredClass + "::activatePointDrawing", arguments);

                if (this.isDrawing) {
                    this.drawingToolbar.deactivate();
                    return;
                }

                this.isDrawing = true;
                this.drawingToolbar.activate(Draw.POINT);
            },
            activateEditing: function(/*evt*/) {
                // summary:
                //      sets up the evetns on the layer
                // layer: the layer added to the map that is going to be edited
                console.log(this.declaredClass + "::activateEditing", arguments);

                this.set('moveText', 'Done');

                if (this.editingSignal) {
                    this.editingToolbar.deactivate();
                    this.editingSignal.remove();
                    this.editingSignal = null;

                    if (this.updatedGraphic) {
                        this.updatedGraphic.setSymbol(null);
                    }

                    this.set('moveText', "Move");
                    topic.publish('app/state', 'editing-finished');

                    return;
                }

                topic.publish('app/state', 'editing-started');

                this.own(
                    this.editingToolbar.on('graphic-move-stop', lang.hitch(this, 'updateMovingGraphic')),
                    this.editingSignal = this.editLayer.on('mouse-over', lang.hitch(this, 'editPoint'))
                );
            },
            updateMovingGraphic: function(evt) {
                // summary:
                //      updates the location of an editing point graphic
                // evt: the mouse event from grahpic-move-stop
                console.log(this.declaredClass + "::updateMovingGraphic", arguments);

                this.updatedGraphic = evt.graphic;
            },
            editPoint: function(evt) {
                // summary:
                //      handles the selection of points and enables/removes the editing functionality
                // evt: mouse event from the editingLayer's mouse-over evetn
                console.log(this.declaredClass + "::editPoint", arguments);

                //do nothing if the current editing graphic is already selected.
                //this happens if mouse-over happens to the already selected graphic
                //while moving or deciding where to put the point.
                if (this.updatedGraphic !== evt.graphic) {

                    if (this.updatedGraphic) {
                        //remove highlighting and stop editing the last graphic
                        this.updatedGraphic.setSymbol(null);
                        this.editingToolbar.deactivate(this.updatedGraphic);
                    }

                    //highlight and activate editing on new graphic
                    evt.graphic.setSymbol(this.symbol);
                    this.editingToolbar.activate(Edit.MOVE, evt.graphic);

                    //store pre and post graphic for undo manager
                    this.updatedGraphic = evt.graphic;

                    //cloning original
                    this.originalGraphic = new Graphic(evt.graphic.toJson());
                }
            },
            saveEdits: function() {
                // summary:
                //      determines what edits to send to the server
                console.log(this.declaredClass + "::saveEdits", arguments);

                if (this.originalGraphic && (this.originalGraphic.toJson() === this.updatedGraphic.toJson())) {
                    //nothing to update, they are the same.
                    console.log('edits are the same skipping');
                    topic.publish('app/state', 'Skipping save. Items are the same.');

                    return;
                }

                topic.publish('map-activity', 1);

                this.editLayer.applyEdits(null, [this.updatedGraphic], null)
                    .then(lang.hitch(this,
                            function() {
                                topic.publish('app/state', 'Edit saved successfully');
                                topic.publish('app/operation-edit', ['update', this.updatedGraphic, this.originalGraphic]);
                            }),
                        function(err) {
                            var message = '';
                            if (err && err.details && lang.isArray(err.details)) {
                                message = err.details[0];
                            }

                            topic.publish('app/state', 'Unable to save. ' + message);
                        })
                    .always(
                        function() {
                            topic.publish('map-activity', -1);
                        });
            },
            addUndoState: function(params) {
                // summary:
                //      handles edit operations/add/delete/update
                // param: array [type, updated graphic, original graphic]
                console.log(this.declaredClass + "::addUndoState", arguments);

                var operation,
                    operationType = params[0],
                    graphic = params[1],
                    original = params[2];

                switch (operationType) {
                    case "add":
                        operation = new Add({
                            addedGraphics: [graphic],
                            featureLayer: this.editLayer
                        });
                        break;
                    case "delete":
                        operation = new Delete({
                            deletedGraphics: [graphic],
                            featureLayer: this.editLayer
                        });
                        break;
                    case "update":
                        operation = new Update({
                            preUpdatedGraphics: [graphic],
                            postUpdatedGraphics: [original],
                            featureLayer: this.editLayer
                        });
                }

                console.log(operation);
                this.undoManager.add(operation);
                domClass.remove(this.undoNode, 'disabled');
                this.updateUndoRedoCounts();
            },
            undo: function(/*evt*/) {
                // summary:
                //      undo edit operation
                // evt: the mouse click event
                console.log(this.declaredClass + "::undo", arguments);

                if (!this.undoManager.canUndo) {
                    //disable undo
                    domClass.add(this.undoNode, 'disabled');
                    console.log('nothing to undo');
                    return;
                }

                //undo redo don't return promise. can't shot activity
                //topic.publish('map-activity', 1);

                domClass.remove(this.redoNode, 'disabled');
                this.undoManager.undo();
                this.updateUndoRedoCounts();
            },
            redo: function(/*evt*/) {
                // summary:
                //      redo operations
                // evt: the mouse click event
                console.log(this.declaredClass + "::redo", arguments);

                if (!this.undoManager.canRedo) {
                    //disable redo
                    console.log('nothing to redo');
                    return;
                }

                //undo redo don't return promise. can't shot activity
                //topic.publish('map-activity', 1);

                this.undoManager.redo();
                this.updateUndoRedoCounts();
            },
            updateUndoRedoCounts: function () {
                // summary:
                //      updates the count bubbles next to the undo and redo buttons
                console.log(this.declaredClass + "::updateUndoRedoCounts", arguments);
                
                var position = this.undoManager.position;
                var len = this.undoManager.length;
                var undo = (position === 0) ? '' : position;
                var redo = (len - position === 0) ? '' : len - position;
                this.set('undoCount', undo);
                this.set('redoCount', redo);
            }
        });
    });