define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/Color',
    'dojo/_base/array',

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
    'esri/dijit/editing/Update',

    'app/config'
], function(
    declare,
    lang,
    Color,
    array,

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
    Update,

    config
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        baseClass: 'editor-panel',

        widgetsInTemplate: true,

        templateString: template,

        // attribute maps
        undoCount: 0,
        _setUndoCountAttr: {
            node: 'undoCountSpan',
            type: 'innerHTML'
        },

        redoCount: 0,
        _setRedoCountAttr: {
            node: 'redoCountSpan',
            type: 'innerHTML'
        },

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
            console.info('app.editor::postCreate', arguments);

            this.inherited(arguments);

            this.editSession = {};

            this.symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color('black'), 1),
                new Color('yellow')
            );

            this.undoManager = new UndoManager({
                maxOperations: 5
            });

            new Tooltip({
                connectId: [this.pointButton],
                label: 'Add address points to the map.'
            });

            new Tooltip({
                connectId: [this.moveButton],
                label: 'Enable moving of address points on the map. Hover over a point, then drag to move it.'
            });

            new Tooltip({
                connectId: [this.undoNode],
                label: 'Make a mistake? Undo the last editing action.'
            });

            new Tooltip({
                connectId: [this.redoNode],
                label: 'Redo the last editing action.'
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
            console.log('app.editor::wireEvents', arguments);

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
                this.drawingToolbar.on('draw-end', lang.hitch(this, 'saveNewPoint')),

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

            this.own(
                topic.subscribe('app/save-edits', lang.hitch(this, 'saveEditsGeneric')),
                this.editingToolbar.on('deactivate', lang.hitch(this, 'saveMoveEdits'))
            );
        },
        saveNewPoint: function(evt) {
            // summary:
            //      applies the edits to the feature layer
            console.log('app.editor::wireEvents', arguments);

            this.newGraphic = new Graphic(evt.geometry, this.symbol, null, null);
            this.map.graphics.add(this.newGraphic);

            var selectQuery = new Query();
            selectQuery.geometry = evt.geometry;

            var context = this;

            topic.publish('app/save-edits', 'add', {
                    adds: [this.newGraphic],
                    updates: null,
                    deletes: null,
                    news: this.newGraphic,
                    original: null
                },
                function() {
                    console.log('success');
                    topic.publish('app/selectFeature', selectQuery);
                },
                null,
                function() {
                    console.log('always');
                    context.map.graphics.remove(context.newGraphic);
                    context.newGraphic = null;
                }
            );
        },
        activatePointDrawing: function() {
            // summary:
            //      enables the toolbar to edit points
            console.log('app.editor::activatePointDrawing', arguments);

            if (this.isDrawing) {
                this.drawingToolbar.deactivate();
                return;
            }

            this.isDrawing = true;
            this.drawingToolbar.activate(Draw.POINT);
        },
        activateEditing: function(/*evt*/ ) {
            // summary:
            //      sets up the evetns on the layer
            // layer: the layer added to the map that is going to be edited
            console.log('app.editor::activateEditing', arguments);

            this.set('moveText', 'Done');

            if (this.editingSignal) {
                this.editingToolbar.deactivate();
                this.editingSignal.remove();
                this.editingSignal = null;

                if (this.updatedGraphic) {
                    this.updatedGraphic.setSymbol(null);
                }

                this.set('moveText', 'Move');
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
            console.log('app.editor::updateMovingGraphic', arguments);

            this.updatedGraphic = evt.graphic;
        },
        editPoint: function(evt) {
            // summary:
            //      handles the selection of points and enables/removes the editing functionality
            // evt: mouse event from the editingLayer's mouse-over evetn
            console.log('app.editor::editPoint', arguments);

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
        saveEditsGeneric: function(type, edits, successBack, errorBack, alwaysBack) {
            // summary:
            //      saves edits
            // type: string: update, edit or delete
            // edits: object: containings the edits
            //        {adds: [],
            //        updates: [],
            //        deletes: [],
            //        news: contains the new/updated graphic, original: contains the original}
            //        null if empty
            // successBack: function: executed on success
            // errorBack: function: executed on error
            // alwaysBack: function: executed always
            console.log('app.editor::saveEditsGeneric', arguments);

            //check on update if anything changed
            if (type === 'update') {
                if (JSON.stringify(edits.original.geometry) === JSON.stringify(edits.news.geometry) &&
                    JSON.stringify(edits.original.attributes) === JSON.stringify(edits.news.attributes)) {
                    //nothing to update, they are the same.
                    console.log('edits are the same skipping');
                    topic.publish('app/state', 'Skipping save. Items are the same.');

                    return;
                }
            }

            //display activity
            console.log('displaying activity');
            topic.publish('map-activity', 1);

            //modify callbacks
            console.log('modifiying activity');
            var modifiedSuccess = function(response) {
                console.log('modified success');

                var error;
                var check = function (edits) {
                    return array.every(edits, function (e) {
                        if (!e.success) {
                            error = e.error;
                        }
                        return e.success;
                    });
                };

                if (check(response.adds) &&
                    check(response.deletes) &&
                    check(response.updates)) {

                    topic.publish('app/operation-edit', type, edits.news, edits.original);
                    topic.publish('app/state', 'Edit saved successfully');

                    if (lang.isFunction(successBack)) {
                        successBack(response);
                    }
                } else {
                    modifiedError(error);
                }
            };

            var modifiedError = function(err) {
                console.log('modified error');
                var message = '';
                if (err && err.details && lang.isArray(err.details)) {
                    message = err.details[0];
                }

                topic.publish('app/state', 'Unable to save. ' + message);

                if (lang.isFunction(errorBack)) {
                    errorBack(err);
                }
            };

            var modifiedAlways = function(response) {
                console.log('modified always');
                topic.publish('map-activity', -1);

                if (lang.isFunction(alwaysBack)) {
                    alwaysBack(response);
                }
            };

            this.applyEditTracking(edits);

            //apply edits
            this.editLayer.applyEdits(edits.adds, edits.updates, edits.deletes)
                .then(null, modifiedError)
                .always(modifiedAlways);

            // couldn't get the correct response object by passing modifiedSuccess to 
            // then above. Had to wire it to the event.
            this.editLayer.on('edits-complete', modifiedSuccess);
        },
        applyEditTracking: function (edits) {
            // summary:
            //      adds user name and current date to edit tracking fields
            // edits: object: containings the edits
            //        {adds: [],
            //        updates: [],
            //        deletes: []
            console.log('app.editor:applyEditTracking', arguments);

            var addAttributes = function (features) {
                array.forEach(features, function (f) {
                    f.attributes[config.fieldNames.Editor] = AGRC.user.email;
                    f.attributes[config.fieldNames.ModifyDate] = Date.now();
                });
            };

            addAttributes(edits.adds);
            addAttributes(edits.updates);
        },
        saveMoveEdits: function() {
            // summary:
            //      determines what edits to send to the server
            console.log('app.editor::saveMoveEdits', arguments);

            topic.publish('map-activity', 1);

            topic.publish('app/save-edits', 'update', {
                    adds: null,
                    updates: [this.updatedGraphic],
                    deletes: null,
                    news: this.updatedGraphic,
                    original: this.originalGraphic
                },
                null,
                null,
                null
            );
        },
        addUndoState: function(operationType, graphic, original) {
            // summary:
            //      handles edit operations/add/delete/update
            // operationType: string: add, update, delete
            // graphic: esri/graphic: the new grahpic
            // original: esri/graphic: the original graphic
            console.log('app.editor::addUndoState', arguments);

            var operation;

            switch (operationType) {
                case 'add':
                    operation = new Add({
                        addedGraphics: [graphic],
                        featureLayer: this.editLayer
                    });
                    break;
                case 'delete':
                    operation = new Delete({
                        deletedGraphics: [graphic],
                        featureLayer: this.editLayer
                    });
                    break;
                case 'update':
                    operation = new Update({
                        preUpdatedGraphics: [original],
                        postUpdatedGraphics: [graphic],
                        featureLayer: this.editLayer
                    });
            }

            console.log(operation);
            this.undoManager.add(operation);
            domClass.remove(this.undoNode, 'disabled');
            this.updateUndoRedoCounts();
        },
        undo: function(/*evt*/ ) {
            // summary:
            //      undo edit operation
            // evt: the mouse click event
            console.log('app.editor::undo', arguments);

            if (!this.undoManager.canUndo) {
                console.log('nothing to undo');

                return;
            }

            //undo redo don't return promise. can't show activity
            //topic.publish('map-activity', 1);

            this.undoManager.undo();
            this.updateUndoRedoCounts();
        },
        redo: function(/*evt*/ ) {
            // summary:
            //      redo operations
            // evt: the mouse click event
            console.log('app.editor::redo', arguments);

            if (!this.undoManager.canRedo) {
                console.log('nothing to redo');

                return;
            }

            //undo redo don't return promise. can't shot activity
            //topic.publish('map-activity', 1);

            this.undoManager.redo();
            this.updateUndoRedoCounts();
        },
        updateUndoRedoCounts: function() {
            // summary:
            //      updates the count bubbles next to the undo and redo buttons
            console.log('app.editor::updateUndoRedoCounts', arguments);

            var position = this.undoManager.position;
            var len = this.undoManager.length;
            var undo = (position === 0) ? '' : position;
            var redo = (len - position === 0) ? '' : len - position;

            this.set('undoCount', undo);
            this.set('redoCount', redo);

            if (this.get('undoCount') < 1) {
                domClass.add(this.undoNode, 'disabled');
                domClass.remove(this.redoNode, 'disabled');
            } else {
                domClass.add(this.redoNode, 'disabled');
                domClass.remove(this.undoNode, 'disabled');
            }
        }
    });
});
