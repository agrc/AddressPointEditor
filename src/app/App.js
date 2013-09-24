define([
        'dojo/text!app/templates/App.html',

        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/_base/declare',
        'dojo/_base/Color',
        'dojo/_base/event',

        'dojo/dom',
        'dojo/on',
        'dojo/aspect',
        'dojo/topic',

        'dojo/dom-construct',
        'dojo/dom-class',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dijit/registry',

        'agrc/widgets/map/BaseMap',
        'agrc/widgets/locate/FindAddress',
        'agrc/widgets/locate/MagicZoom',

        'ijit/widgets/notify/ChangeRequest',

        'esri/layers/FeatureLayer',
        'esri/config',
        'esri/tasks/GeometryService',
        'esri/geometry/Extent',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',

        'app/SlideInSidebar',
        'app/Leaderboard',
        'app/DownloadSelector',
        'app/Editor',
        'app/AttributeEditor',
        'app/Toaster'
    ],

    function(
        template,

        array,
        lang,
        declare,
        Color,
        event,

        dom,
        on,
        aspect,
        topic,

        domConstruct,
        domClass,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,

        registry,

        BaseMap,
        FindAddress,
        MagicZoom,
        ChangeRequest,
        featureLayer,
        config,
        geomService,
        Extent,
        SimpleMarkerSymbol,
        SimpleLineSymbol,

        SlideInSidebar,
        Leaderboard,
        DownloadSelector,
        Editor,
        AttributeEditor,
        Toaster
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

            //array: keeping history of edits for tracking
            edits: null,

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

                this.addFeatureLayer();

                this.findAddress = new FindAddress({
                    map: this.map,
                    apiKey: AGRC.apiKey
                }, this.findAddressDiv);

                this.magicZoom = new MagicZoom({
                    map: this.map,
                    mapServiceURL: AGRC.urls.basemap,
                    searchLayerIndex: 3,
                    searchField: 'Name',
                    maxResultsToDisplay: 10
                }, this.magicZoomDiv);

                this.changeRequest = new ChangeRequest({
                    map: this.map
                }, this.suggestChangeDiv);

                this.downloadWizard = new DownloadSelector({},
                    this.downloadDiv);

                this.sideBar = new SlideInSidebar({
                    map: this.map
                }, this.sideBarNode);

                this.leaderboard = new Leaderboard({
                    url: AGRC.urls.leaderboard,
                    linkNode: this.leaderboardDiv,
                    contentNode: this.leaderboardContentDiv
                });

                this.wireEvents();

                this.toaster = new Toaster({}, this.toasterNode);

                this.editor = new Editor({
                    map: this.map,
                    editLayer: this.editLayer
                }, domConstruct.place('<div>', this.map.container, 'last'));

                this.attributeEditor = new AttributeEditor({
                    sideBar: this.sideBar,
                    editLayer: this.editLayer,
                    map: this.map
                });
            },
            wireEvents: function() {
                console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

                this.own(on(window, 'resize',
                    function() {
                        topic.publish('window/resize', true);
                    }
                ));
                topic.subscribe('window/resize', lang.hitch(this, 'resize'));

                this.own(this.map.on("layers-add-result", lang.hitch(this, 'initEditing')));
                this.own(
                    on(this.changeRequest, 'drawStart', function() {
                        console.log('on draw start');
                        var ddl = $('#suggest-change-dropdown');
                        ddl.dropdown('toggle');
                        ddl.blur();
                        $('.dropdown').blur();
                    }),

                    on(this.changeRequest, 'drawEnd', function() {
                        console.log('on draw end');
                        setTimeout(function() {
                            $('#suggest-change-dropdown').dropdown('toggle');
                        }, 100);
                    })
                );

                this.own(
                    aspect.before(this.sideBar, 'show',
                        function() {
                            topic.publish('app/state', 'Fill out the address details for this point.');
                        })
                );

                this.own(
                    aspect.after(this.findAddress, 'done', lang.hitch(this,
                        function() {
                            setTimeout(lang.hitch(this,
                                function() {
                                    this.findAddress.graphicsLayer.remove(this.findAddress._graphic);
                                }), 5000);
                        }))
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
                        "xmin": 442054,
                        "ymin": 4100235,
                        "xmax": 446951,
                        "ymax": 4103608,
                        "spatialReference": {
                            "wkid": 26912
                        }
                    })
                });

                config.defaults.geometryService = new geomService(AGRC.urls.geometryService);
            },
            addFeatureLayer: function() {
                console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

                var id = 0;

                if (id < 0) {
                    return;
                }

                if (this.editLayer) {
                    this.map.removeLayer(this.editLayer);
                }

                this.editLayer = new featureLayer(AGRC.urls.featureLayer + id, {
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

                this.attributeEditor.initialize(evt.layers);
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