define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/event',

    'dojo/dom-construct',

    'dojo/topic',
    'dojo/aspect',

    'dojo/text!app/templates/AttributeEditor.html',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dijit/form/Button',

    'esri/geometry/Extent',
    'esri/geometry/Point',
    'esri/tasks/query',
    'esri/dijit/AttributeInspector',
    'esri/layers/FeatureLayer',
    'esri/graphic',

    'app/config',
    'app/AttributeCopyPaste'
], function (
    declare,
    lang,
    array,
    evt,

    domConstruct,
    topic,
    aspect,

    template,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Button,

    Extent,
    Point,
    Query,
    AttributeInspector,
    FeatureLayer,
    Graphic,

    config,
    AttributeCopyPaste
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        baseClass: 'attribute-editor',

        widgetsInTemplate: true,

        templateString: template,

        //sideBar: app/SlideInSidebar

        // attributeEditor: esri/dijit/AttributeEditor
        attributeEditor: null,

        //saveButton: dijit/form/Button
        saveButton: null,

        //selectQuery: esri/tasks/QueryTask
        selectQuery: null,

        //updateFeature: esri/graphic
        updateFeature: null,

        //esri/graphic: keeps track of the original graphic for the undomanager
        originalFeature: null,

        //activeToolbar: drawing, editing, navigation
        activeToolbar: 'navigation',

        // childWidgets: _WidgetBase[]
        childWidgets: null,

        constructor: function () {
            console.info('app.attributeEditor::constructor', arguments);

            this.childWidgets = [];
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.info('app.attributeEditor::postCreate', arguments);

            this.inherited(arguments);

            this.selectQuery = new Query();

            this.wireEvents();
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      sets up the events for this widget
            console.log('app.attributeEditor::wireEvents', arguments);

            this.own(
                this.map.on('click', lang.hitch(this, function (evt) {
                    if (this.activeToolbar === 'navigation') {
                        topic.publish('app/identify-click', evt);
                        this.sideBar.hide();
                        this.editLayer.clearSelection();
                    }
                })),
                this.editLayer.on('click', lang.hitch(this, 'buildQuery')),
                aspect.before(this, 'buildQuery', function () {
                    topic.publish('map-activity', 1);
                }, true),
                topic.subscribe('app/toolbar', lang.hitch(this, 'notifyToolbarActivation')),
                topic.subscribe('app/selectFeature', lang.hitch(this, 'selectFeature'))
            );

            if (this.editLayer) {
                this.own(
                    this.editLayer.on('edits-complete', lang.hitch(this, 'saveEdits'))
                );
            }
        },
        buildQuery: function (mouseEvt) {
            // summary:
            //      builds the query to pass to the select features method
            // evt: the click event
            console.log('app.attributeEditor::buildQuery', arguments);

            this.selectQuery.geometry = this._screenPointToEnvelope(mouseEvt);

            this.selectFeature(this.selectQuery);

            evt.stop(mouseEvt);
        },
        selectFeature: function (selectQuery) {
            // summary:
            //      selects the feature
            // selectQuery: the query to find the feature
            console.log('app.attributeEditor::selectFeature', arguments);

            if (lang.isArray(selectQuery)) {
                selectQuery = selectQuery[0];
            }

            this.editLayer.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW, lang.hitch(this,
                function (features) {
                    if (features.length > 0) {
                        this.updateFeature = features[0];
                        this.originalFeature = new Graphic(features[0].toJson());
                        this.sideBar.show();
                    } else {
                        this.updateFeature = null;
                        this.originalFeature = null;
                        this.editLayer.clearSelection();
                        this.sideBar.hide();
                    }

                    topic.publish('map-activity', -1);
                }));
        },
        initialize: function (layer, isEditable) {
            console.log('app.attributeEditor::initialize', arguments);

            var fieldInfos = [];
            var hideFields = {
                OBJECTID: 1,
                Shape: 1
            };
            hideFields[config.fieldNames.Editor] = 1;
            hideFields[config.fieldNames.ModifyDate] = 1;

            array.forEach(layer.fields, function (f) {
                if (!(f.name in hideFields)) {
                    fieldInfos.push({
                        fieldName: f.name,
                        isEditable: isEditable && f.editable,
                        label: f.alias
                    });
                }
            });
            var layerInfos = [{
                featureLayer: layer,
                showAttachments: false,
                isEditable: isEditable,
                fieldInfos: fieldInfos,
                showDeleteButton: isEditable
            }];

            this.own(
                this.attributeEditor = new AttributeInspector({
                    layerInfos: layerInfos
                }, domConstruct.create('div', null, this.sideBar.contentDiv, 'first')),
                this.saveButton = new Button({
                    label: 'Save',
                    'class': 'atiSaveButton'
                }),
                this.copyPaste = new AttributeCopyPaste({
                    featureLayer: layer,
                    attributeEditor: this.attributeEditor
                })
            );

            if (!isEditable) {
                return;
            }

            this.saveButton.set('disabled', true);

            domConstruct.place(this.saveButton.domNode, this.attributeEditor.editButtons, 'first');
            var that = this;

            this.own(
                this.saveButton.on('click', function () {
                    that.saveButton.set('disabled', true);
                    that.attributeEditor.deleteBtn.set('disabled', true);

                    that.saveButton.set('innerHTML', 'Saving Edits.');

                    topic.publish('app/save-edits', 'update', {
                        adds: null,
                        updates: [that.updateFeature],
                        deletes: null,
                        news: that.updateFeature,
                        original: that.originalFeature
                    },
                    function () {
                        that.attributeEditor.deleteBtn.set('disabled', false);
                        that.saveButton.set('innerHTML', 'Save');
                    }, null, null);
                }),

                this.attributeEditor.on('attribute-change', function (evt) {
                    that.updateFeature.attributes[evt.fieldName] = evt.fieldValue;
                    console.log('attribute-change');

                    that.saveButton.set('disabled', false);
                }),

                this.attributeEditor.on('next', function (evt) {
                    if (!evt || !evt.feature) {
                        return;
                    }
                    that.originalFeature = new Graphic(evt.feature.toJson());
                    that.updateFeature = evt.feature;
                }),

                this.attributeEditor.on('delete', function (evt) {
                    topic.publish('map-activity', 1);
                    var feature = evt.feature;
                    that.originalFeature = null;

                    that.saveButton.set('disabled', true);
                    that.attributeEditor.deleteBtn.set('disabled', true);
                    that.attributeEditor.deleteBtn.set('innerHTML', 'Deleting');

                    topic.publish('app/save-edits', 'delete', {
                        adds: null,
                        updates: null,
                        deletes: [feature],
                        news: evt.grahpic,
                        original: null
                    },
                    function () {
                        if (that.editLayer.getSelectedFeatures().length === 0) {
                            that.sideBar.hide();
                        }

                        that.attributeEditor.deleteBtn.set('disabled', false);
                        that.attributeEditor.deleteBtn.set('innerHTML', 'Delete');
                    },
                    null,
                    null);
                }));
        },
        saveEdits: function (response) {
            // summary:
            //      saves the edits from the attribute inspector
            // response: the edits-complete event from the attribute/inspector
            console.log('app.attributeEditor::saveEdits', arguments);

            topic.publish('map-activity', -1);

            var fieldsDefiningSuccess = ['adds', 'updates', 'deletes'];

            var editsToTrack = {
                user: 'test',
                changes: []
            };

            array.forEach(fieldsDefiningSuccess,
                function (prop) {
                    array.forEach(response[prop],
                        function (status) {
                            if (!status && !status.success) {
                                return;
                            }

                            editsToTrack.changes.push({
                                type: prop
                            });
                        }, this);
                }, this);

            //if success send basic edit info to tracking service
        },
        notifyToolbarActivation: function (toolbar) {
            // summary:
            //      lets the applicaiton know what toolbars are active
            // toolbar: string "drawing" or "editing" or "navigation"
            console.log('app.attributeEditor::notifyToolbarActivation', arguments);

            this.activeToolbar = 'navigation';

            if (!toolbar) {
                return;
            }

            this.activeToolbar = toolbar;
        },
        _screenPointToEnvelope: function (evt) {
            console.log('app.attributeEditor::_screenPointToEnvelope', arguments);

            var centerPoint = new Point(evt.mapPoint.x, evt.mapPoint.y, evt.mapPoint.spatialReference);
            var mapWidth = this.map.extent.getWidth();

            //Divide width in map units by width in pixels
            var pixelWidth = mapWidth / this.map.width;

            //Calculate a 10 pixel envelope width (5 pixel tolerance on each side)
            var tolerance = 10 * pixelWidth;

            //Build tolerance envelope and set it as the query geometry
            var queryExtent = new Extent(1, 1, tolerance, tolerance, evt.mapPoint.spatialReference);

            return queryExtent.centerAt(centerPoint);
        }
    });
});
