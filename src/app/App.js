define([
        'dojo/text!app/templates/App.html',

        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/_base/Color',
        'dojo/dom',
        'dojo/on',
        'dojo/dom-construct',
        'dojo/dom-class',
        'dojo/aspect',
        'dojo/query',
        'dojo/parser',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/registry',
        'dijit/form/Button',

        'agrc/widgets/map/BaseMap',
        'agrc/widgets/locate/FindAddress',

        'ijit/widgets/notify/ChangeRequest',

        'esri/dijit/editing/Editor',
        'esri/dijit/AttributeInspector',
        'esri/layers/FeatureLayer',
        'esri/config',
        'esri/tasks/GeometryService',
        'esri/geometry/Extent',
        'esri/geometry/Point',
        'esri/tasks/query',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/toolbars/edit',
        'esri/toolbars/draw',

        'app/SlideInSidebar'
    ],

    function(
        template,
        array,
        lang,
        declare,
        Color,
        dom,
        on,
        domConstruct,
        domClass,
        aspect,
        query,
        parser,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        registry,
        Button,
        BaseMap,
        FindAddress,
        ChangeRequest,
        editor,
        AttributeEditor,
        featureLayer,
        config,
        geomService,
        Extent,
        Point,
        Query,
        SimpleMarkerSymbol,
        SimpleLineSymbol,
        Edit,
        Draw,
        SlideInSidebar
    ) {
        return declare("app.App", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            // summary:
            //      The main widget for the app

            widgetsInTemplate: true,
            templateString: template,
            baseClass: 'app',

            // map: agrc.widgets.map.Basemap
            map: null,

            // findAddress: agrc/widgets/locate/FindAddress
            findAddress: null,

            // changeRequest: ijit/widgets/notify/ChangeRequest
            changeRequest: null,

            // sideBar: app/SlideInSidebar
            sideBar: null,

            // attributeEditor: esri/dijit/AttributeEditor
            attributeEditor: null,

            //selectQuery: esri/tasks/QueryTask
            selectQuery: null,

            //saveButton: dijit/form/Button
            saveButton: null,

            //updateFeature: esri/graphic
            updateFeature: null,

            //drawingToolbar: esri/toolbars/draw
            drawingToolbar: null,

            //editingToolbar: esri/toolbars/edit
            editingToolbar: null,

            constructor: function() {
                // summary:
                //      first function to fire after page loads
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                AGRC.app = this;
            },
            postCreate: function() {
                // summary:
                //      Fires when 
                console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.selectQuery = new Query();

                this.initMap();

                this.addFeatureLayer();

                this.findAddress = new FindAddress({
                    map: this.map,
                    apiKey: AGRC.apiKey
                }, this.findAddressDiv);

                this.changeRequest = new ChangeRequest({
                    map: this.map
                }, this.suggestChangeDiv);

                this.wireEvents();

                this.sideContent = new SlideInSidebar({
                    map: this.map
                }, this.sideBar);
            },
            wireEvents: function() {
                this.own(
                    on(window, 'resize', lang.hitch(this, this.resize)),

                    //on(this.map, "LayersAddResult", lang.hitch(this, 'initEditing')),

                    this.map.on("layers-add-result", lang.hitch(this, 'initEditing')),

                    this.changeRequest.on('draw-start', function() {
                        console.log('on draw start');
                        var ddl = $('#suggest-change-dropdown');
                        ddl.dropdown('toggle');
                        ddl.blur();
                        $('.dropdown').blur();
                    }),

                    this.changeRequest.on('draw-end', function() {
                        console.log('on draw end');
                        setTimeout(function() {
                            $('#suggest-change-dropdown').dropdown('toggle');
                        }, 100);
                    }),

                    this.editLayer.on("edits-complete", function(response) {
                        console.log("onEditsComplete");
                        console.log(response);
                    }),

                    this.map.on("click", lang.hitch(this, function(evt) {
                        this.sideContent.show();
                        this.selectQuery.geometry = this._screenPointToEnvelope(evt);
                        this.editLayer.selectFeatures(this.selectQuery, esri.layers.FeatureLayer.SELECTION_NEW, lang.hitch(this, function(features) {
                            if (features.length > 0) {
                                this.updateFeature = features[0];
                            } else {
                                this.updateFeature = null;
                                this.editLayer.clearSelection();
                                this.sideContent.hide();
                            }
                        }));
                    }))
                );
            },
            _screenPointToEnvelope: function(evt) {
                var centerPoint = new Point(evt.mapPoint.x, evt.mapPoint.y, evt.mapPoint.spatialReference);
                var mapWidth = this.map.extent.getWidth();

                //Divide width in map units by width in pixels
                var pixelWidth = mapWidth / this.map.width;

                //Calculate a 10 pixel envelope width (5 pixel tolerance on each side)
                var tolerance = 10 * pixelWidth;

                //Build tolerance envelope and set it as the query geometry
                var queryExtent = new Extent(1, 1, tolerance, tolerance, evt.mapPoint.spatialReference);

                return queryExtent.centerAt(centerPoint);
            },
            initMap: function() {
                // summary:
                //      Sets up the map
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.map = new BaseMap(this.mapDiv, {
                    defaultBaseMap: 'Lite',
                    extent: new Extent({
                        "type": "extent",
                        "xmin": 442054,
                        "ymin": 4100235,
                        "xmax": 446951,
                        "ymax": 4103608,
                        "spatialReference": {
                            "wkid": 26912
                        }
                    })
                });

                config.defaults.geometryService = new geomService("http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer");
            },
            addFeatureLayer: function() {
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var id = 0;

                if (id < 0) {
                    return;
                }

                if (this.editLayer) this.map.removeLayer(this.editLayer);

                this.editLayer = new featureLayer("/arcgis/rest/services/demo/Editing/FeatureServer/" + id, {
                    mode: featureLayer.MODE_ONDEMAND,
                    useMapTime: false,
                    outFields: ['HouseAddr', 'FullAddr', 'HouseNum', 'PreDir', 'StreetName', 'StreetType', 'SufDir', 'UnitNumber', 'City', 'ZipCode']
                });

                var symbol = new SimpleMarkerSymbol(
                    SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color("black"), 1),
                    new Color("aqua")
                );

                this.editLayer.setSelectionSymbol(symbol);

                this.map.addLayers([this.editLayer]);
            },
            fullExtent: function() {
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.map.setExtent(new Extent({
                    xmin: 81350,
                    ymin: 3962431,
                    xmax: 800096,
                    ymax: 4785283,
                    spatialReference: {
                        wkid: 26912
                    }
                }));
            },
            initEditing: function(evt) {
                // sumamry:
                //      initializes the editing settings/widget
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this._createSliderTools();

                var layer = evt.layers;

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

                this.attributeEditor = new AttributeEditor({
                    layerInfos: layerInfos
                }, domConstruct.create("div", null, this.sideContent.contentDiv, "first"));

                this.saveButton = new Button({
                    label: "Save",
                    "class": "atiSaveButton"
                });

                domConstruct.place(this.saveButton.domNode, this.attributeEditor.editButtons, "first");
                var that = this;

                this.own(
                    this.saveButton.on("click", function() {
                        that.saveButton.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('disabled', true);

                        that.saveButton.set('innerHTML', 'Saving Edits.');

                        that.updateFeature.getLayer().applyEdits(null, [that.updateFeature], null)
                            .then(function(response) {
                                that.saveButton.set('disabled', false);
                                that.attributeEditor.deleteBtn.set('disabled', false);
                                that.saveButton.set('innerHTML', 'Save');

                                console.log('save response');
                                console.log(response);
                            }, function(response) {
                                console.log('save error response');
                                console.log(response);
                            });
                    }),

                    this.attributeEditor.on("attribute-change", function(evt) {
                        that.updateFeature.attributes[evt.fieldName] = evt.fieldValue;
                        console.log('attribute-change');
                    }),

                    this.attributeEditor.on("next", function(evt) {
                        that.updateFeature = evt.feature;
                        console.log('next');
                    }),

                    this.attributeEditor.on("delete", function(evt) {
                        var feature = evt.feature;

                        that.saveButton.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('disabled', true);
                        that.attributeEditor.deleteBtn.set('innerHTML', 'Deleting');

                        feature.getLayer().applyEdits(null, null, [feature]);
                    }));
            },
            _createSliderTools: function() {
                console.log(this.declaredClass + "::resize", arguments);

                var globeContainer = domConstruct.create("div", {
                    "class": 'esriSimpleSliderGlyphButton'
                });

                var markerContainer = lang.clone(globeContainer);

                var node = query(".esriSimpleSliderIncrementButton", this.map._slider)[0],

                    globe = domConstruct.create("span", {
                        "class": "glyphicon"
                    }, globeContainer),
                    marker = domConstruct.create("span", {
                        "class": "glyphicon"
                    }, markerContainer);

                on(globeContainer, 'click', lang.hitch(this, 'fullExtent'));
                on(markerContainer, 'click', lang.hitch(this, 'fullExtent'));

                domClass.add(globe, "glyphicon-globe");
                domClass.add(marker, "glyphicon-map-marker");

                domConstruct.place(markerContainer,
                    node, "after");

                domConstruct.place(globeContainer,
                    node, "after");
            },
            resize: function() {
                // summary:
                //      resizes the map and popup divs
                console.log(this.declaredClass + "::resize", arguments);

                if (!this.map) {
                    return;
                }

                this.map.resize();
            }
        });
    });