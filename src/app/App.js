define([
        'dojo/text!app/templates/App.html',

        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/dom',
        'dojo/on',
        'dojo/dom-construct',
        'dojo/aspect',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/registry',

        'agrc/widgets/map/BaseMap',
        'agrc/widgets/locate/FindAddress',

        'ijit/widgets/notify/ChangeRequest',

        'esri/dijit/editing/Editor',
        'esri/dijit/AttributeInspector',
        'esri/layers/FeatureLayer',
        'esri/config',
        'esri/tasks/GeometryService',
        'esri/geometry/Extent',

        'app/SlideInSidebar'
    ],

    function(
        template,
        array,
        lang,
        declare,
        dom,
        on,
        construct,
        aspect,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        registry,
        BaseMap,
        FindAddress,
        ChangeRequest,
        editor,
        attributeEditor,
        featureLayer,
        config,
        geomService,
        Extent,
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

                this.initMap();


                this.findAddress = new FindAddress({
                    map: this.map,
                    apiKey: AGRC.apiKey
                }, this.findAddressDiv);

                console.log('creating change request');

                this.changeRequest = new ChangeRequest({
                    map: this.map
                }, this.suggestChangeDiv);

                this.wireEvents();

                this.sideContent = new SlideInSidebar({map: this.map}, this.sideBar);
                this.sideContent.show();
            },
            wireEvents: function() {
                this.own(
                    on(window, 'resize', lang.hitch(this, this.resize)),
                    on(this.map, "LayersAddResult", lang.hitch(this, 'initEditing')),
                    aspect.after(this.changeRequest, 'onDrawStart', function() {
                        console.log('on draw start');
                        var ddl = $('#suggest-change-dropdown');
                        ddl.dropdown('toggle');
                        ddl.blur();
                        $('.dropdown').blur();
                    }),
                    aspect.after(this.changeRequest, 'onDrawEnd', function() {
                        console.log('on draw end');
                        setTimeout(function() { $('#suggest-change-dropdown').dropdown('toggle'); }, 100);
                    })
                );
            },
            initMap: function() {
                // summary:
                //      Sets up the map
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.map = new BaseMap(this.mapDiv, {
                    defaultBaseMap: 'Lite',
                    extent: new Extent({
                        "type": "extent",
                        "xmin": 406719.3295027474,
                        "ymin": 4486834.867579307,
                        "xmax": 435956.49282178795,
                        "ymax": 4516607.090096343,
                        "spatialReference": {
                            "wkid": 26912
                        }
                    })
                });

                config.defaults.geometryService = new geomService("http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer");
            },
            addFeatureLayer: function(find) {
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var lookup = {
                    'kane': 0
                };

                var key = find.query.toLowerCase();
                var id = lookup[key];

                if (id < 0) {
                    return;
                }

                if (this.editLayer) this.map.removeLayer(this.editLayer);

                this.editLayer = new featureLayer("/arcgis/rest/services/demo/AddressPoints_Kane/FeatureServer/" + id, {
                    mode: featureLayer.MODE_ONDEMAND,
                    outFields: ['HouseAddr', 'FullAddr', 'HouseNum', 'PreDir', 'StreetName', 'StreetType', 'SufDir', 'UnitNumber', 'City', 'ZipCode']
                });

                this.map.addLayers([this.editLayer]);
            },
            initEditing: function(layer) {
                // sumamry:
                //      initializes the editing settings/widget
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var featureLayerInfos = array.map(layer, function(result) {
                    return {
                        "featureLayer": result.layer
                    };
                });

                // var settings = {
                //     map: this.map,
                //     layerInfos: featureLayerInfos
                // };

                // var params = {
                //     settings: settings
                // };

                // if (this.editingpane) this.paneStack.remove(this.editingpane);

                // this.editingpane = new titlePane({
                //     title: "Edit Address Points",
                //     open: true
                // });

                // this.countypane.toggle();
                // this.paneStack.add(this.editingpane);

                // var editorWidget = new editor(params, this.editingpane.containerNode);

                // editorWidget.startup();
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