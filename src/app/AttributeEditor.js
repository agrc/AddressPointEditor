define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/event',

        'dojo/dom-construct',

        'dojo/topic',

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
    ],

    function(
        declare,
        lang,
        array,
        evt,

        domConstruct,
        topic,

        template,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        Button,

        Extent,
        Point,
        Query,
        AttributeInspector,
        FeatureLayer
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.attrubuteEditor", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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

            //activeToolbar: drawing, editing, navigation
            activeToolbar: "navigation",

            constructor: function() {
                console.info(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.selectQuery = new Query();

                this.wireEvents();
            },
            wireEvents: function() {
                // summary:
                //      sets up the events for this widget
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.own(
                    this.map.on("click", lang.hitch(this, function() {
                        console.log('map::click' + this.activeToolbar);
                        if (this.activeToolbar !== "navigation") {
                            this.sideBar.show();
                        } else {
                            this.sideBar.hide();
                            this.editLayer.clearSelection();
                        }
                    })),

                    this.editLayer.on("click", lang.hitch(this, 'buildQuery'))
                );

                if (this.editLayer) {
                    this.own(
                        this.editLayer.on("edits-complete", lang.hitch(this,
                            function(response) {
                                this.map.hideLoader();

                                var fieldsDefiningSuccess = ['adds', 'updates', 'deletes'];
                                var editsToTrack = {
                                    user: 'test',
                                    changes: []
                                };

                                array.forEach(fieldsDefiningSuccess,
                                    function(prop) {
                                        array.forEach(response[prop],
                                            function(status) {
                                                if (!status && !status.success)
                                                    return;

                                                editsToTrack.changes.push({
                                                    type: prop
                                                });
                                            }, this);
                                    }, this);

                                //if success send basic edit info to tracking service
                                console.log("edits-complete");
                                console.log(editsToTrack);
                            }))
                    );
                }

                topic.subscribe('app/toolbar', lang.hitch(this, 'notifyToolbarActivation'));
                topic.subscribe('app/selectFeature', lang.hitch(this, 'selectFeature'));
            },
            buildQuery: function(mouseEvt) {
                // summary:
                //      builds the query to pass to the select features method
                // evt: the click event
                console.log(this.declaredClass + "::buildQuery", arguments);

                this.map.showLoader();

                this.selectQuery.geometry = this._screenPointToEnvelope(mouseEvt);

                this.selectFeature(this.selectQuery);

                evt.stop(mouseEvt);
            },
            selectFeature: function(selectQuery) {
                // summary:
                //      selects the feature
                // selectQuery: the query to find the feature
                console.log(this.declaredClass + "::selectFeature", arguments);

                if (lang.isArray(selectQuery))
                    selectQuery = selectQuery[0];

                this.editLayer.selectFeatures(selectQuery, FeatureLayer.SELECTION_NEW, lang.hitch(this,
                    function(features) {
                        if (features.length > 0) {
                            this.updateFeature = features[0];
                            this.sideBar.show();
                        } else {
                            this.updateFeature = null;
                            this.editLayer.clearSelection();
                            this.sideBar.hide();
                        }
                        this.map.hideLoader();
                    }));
            },
            initialize: function(layer) {
                console.log(this.declaredClass + "::initialize", arguments);

                var featureLayerInfos = array.map(layer, function(result) {
                    return {
                        "featureLayer": result.layer
                    };
                });

                var layerInfos = [{
                    'featureLayer': featureLayerInfos[0].featureLayer,
                    'showAttachments': false,
                    'isEditable': true,
                    'fieldInfos': [{
                        'fieldName': 'HouseAddr',
                        'isEditable': true,
                        'tooltip': 'The House Address',
                        'label': 'House Address:'
                    }, {
                        'fieldName': 'FullAddr',
                        'isEditable': true,
                        'tooltip': 'The full address',
                        'label': 'FullAddr:'
                    }]
                }];

                this.attributeEditor = new AttributeInspector({
                    layerInfos: layerInfos
                }, domConstruct.create("div", null, this.sideBar.contentDiv, "first"));

                this.saveButton = new Button({
                    label: "Save",
                    "class": "atiSaveButton"
                });

                this.saveButton.set('disabled', true);

                domConstruct.place(this.saveButton.domNode, this.attributeEditor.editButtons, "first");
                var that = this;

                this.own(
                    this.saveButton.on("click", function() {
                        that.map.showLoader();
                        that.saveButton.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('disabled', true);

                        that.saveButton.set('innerHTML', 'Saving Edits.');

                        that.updateFeature.getLayer().applyEdits(null, [that.updateFeature], null)
                            .then(function() {
                                // that.saveButton.set('disabled', false);
                                that.attributeEditor.deleteBtn.set('disabled', false);
                                that.saveButton.set('innerHTML', 'Save');
                                that.map.hideLoader();

                            }, function(response) {
                                console.log('save error response');
                                console.log(response);
                            });
                    }),

                    this.attributeEditor.on("attribute-change", function(evt) {
                        that.updateFeature.attributes[evt.fieldName] = evt.fieldValue;
                        console.log('attribute-change');

                        that.saveButton.set('disabled', false);
                    }),

                    this.attributeEditor.on("next", function(evt) {
                        that.updateFeature = evt.feature;
                        console.log('next');
                    }),

                    this.attributeEditor.on("delete", function(evt) {
                        that.map.showLoader();
                        var feature = evt.feature;

                        that.saveButton.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('innerHTML', 'Deleting');

                        feature.getLayer().applyEdits(null, null, [feature])
                            .then(function() {
                                that.map.hideLoader();
                                
                                if(that.editLayer.getSelectedFeatures().length === 0)
                                {   
                                    that.sideBar.hide();
                                }

                                that.attributeEditor.deleteBtn.set('disabled', false);
                                that.attributeEditor.deleteBtn.set('innerHTML', 'Delete');
                            });
                    }));
            },
            notifyToolbarActivation: function(toolbar) {
                // summary:
                //      lets the applicaiton know what toolbars are active
                // toolbar: string "drawing" or "editing" or "navigation"
                console.log(this.declaredClass + "::notifyToolbarActivation", arguments);

                this.activeToolbar = "navigation";

                if (!toolbar || !lang.isArray(toolbar))
                    return;

                this.activeToolbar = toolbar[0];
            },
            _screenPointToEnvelope: function(evt) {
                console.log(this.declaredClass + "::_screenPointToEnvelope", arguments);

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