/* global $ */
define([
    'dojo/text!./templates/App.html',

    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/_base/Color',

    'dojo/on',
    'dojo/aspect',
    'dojo/topic',
    'dojo/Stateful',

    'dojo/dom-construct',
    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/locate/ZoomToCoords',
    'agrc/widgets/locate/TRSsearch',

    'agrc/widgets/map/BaseMapSelector',

    'ijit/widgets/notify/ChangeRequest',
    'ijit/widgets/authentication/LoginRegister',

    'esri/config',
    'esri/graphic',

    'esri/layers/FeatureLayer',
    'esri/layers/GraphicsLayer',
    'esri/layers/LabelLayer',
    'esri/tasks/GeometryService',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/TextSymbol',
    'esri/renderers/SimpleRenderer',

    'app/config',
    'app/SlideInSidebar',
    'app/DownloadSelector',
    'app/Editor',
    'app/AttributeEditor',
    'app/Toaster',
    'app/ParcelIdentify',


    'bootstrap'
], function (
    template,

    array,
    lang,
    declare,
    Color,

    on,
    aspect,
    topic,
    Stateful,

    domConstruct,
    domClass,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    BaseMap,
    FindAddress,
    MagicZoom,
    ZoomToCoords,
    TrsSearch,

    BaseMapSelector,

    ChangeRequest,
    LoginRegister,

    esriConfig,
    Graphic,

    FeatureLayer,
    GraphicsLayer,
    LabelLayer,
    GeomService,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    TextSymbol,
    SimpleRenderer,

    config,
    SlideInSidebar,
    DownloadSelector,
    Editor,
    AttributeEditor,
    Toaster,
    ParcelIdentify
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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

        //activity: dojo/Stateful number of operations causing activity indicator to show
        activity: 0,

        // childWidgets: _WidgetBase[]
        childWidgets: null,

        // searchGraphics: esri/layers/GraphicsLayer
        // summary:
        //      the graphics layer to be used with the find address task
        searchGraphics: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            esriConfig.app = this;

            this.childWidgets = [];
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // needs to happen here since remember me race condition
            var that = this;
            topic.subscribe(LoginRegister.prototype.topics.signInSuccess, function (result) {
                window.AGRC.user = result.user;
                that.identifyTopic.remove();
                that.enableEditingLayer();
            });

            this.version.innerHTML = config.version;

            this.activity = new Stateful({
                count: 0
            });

            this.initMap();

            this.initGraphicLayers();

            this.childWidgets.push(
                new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    showOnLoad: false,
                    securedServicesBaseUrl: config.urls.editLayer
                }),
                this.findAddress = new FindAddress({
                    map: this.map,
                    apiKey: window.AGRC.apiKey
                }, this.findAddressDiv),
                this.magicZoom = new MagicZoom({
                    map: this.map,
                    mapServiceURL: window.AGRC.urls.basemap,
                    searchLayerIndex: 3,
                    searchField: 'Name',
                    graphicsLayer: this.searchGraphics,
                    maxResultsToDisplay: 10
                }, this.magicZoomDiv),
                this.zoomCoords = new ZoomToCoords({
                    map: this.map
                }, this.coordDiv),
                this.changeRequest = new ChangeRequest({
                    map: this.map,
                    redliner: config.urls.redline,
                    toIds: [3, 5, 6]
                }, this.suggestChangeDiv),
                this.downloadWizard = new DownloadSelector({},
                    this.downloadDiv),
                this.sideBar = new SlideInSidebar({
                    map: this.map
                }, this.sideBarNode),
                this.toaster = new Toaster({}, this.toasterNode),
                this.parcelIdentify = new ParcelIdentify({
                    map: this.map
                }, this.parcelIdentifyNode),
                this.trsSearch = new TrsSearch({
                    map: this.map,
                    apiKey: window.AGRC.apiKey
                },
                    this.trsDiv)
            );

            this.wireEvents();
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    id: 'claro',
                    position: 'TR'
                })
            );

            esriConfig.defaults.geometryService = new GeomService(window.AGRC.urls.geometryService);
        },
        initGraphicLayers: function () {
            // summary:
            //      creates the feature layer objects
            //
            console.log('app.App::initGraphicLayer', arguments);

            var layerId = 0;

            var url = window.AGRC.urls.viewLayer + layerId;
            this.editLayer = new FeatureLayer(url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                useMapTime: false,
                outFields: ['*'],
                id: 'viewLayer',
                minScale: 144448
            });

            this.labelRenderer = new SimpleRenderer(new TextSymbol()
                .setOffset(-22, 20)
                .setAngle(-15)
                .setHorizontalAlignment('start'));
            this.labelExpression = '{' + config.fieldNames.FullAddress + '}';

            this.labelLayer = new LabelLayer();
            this.labelLayer.id = 'labelLayer';
            this.labelLayer.minScale = config.labelsMinScale;
            this.labelLayer.addFeatureLayer(this.editLayer, this.labelRenderer, this.labelExpression);

            this.searchGraphics = new GraphicsLayer({
                id: 'searchGraphics'
            });
        },
        wireEvents: function () {
            console.log('app.App::wireEvents', arguments);

            this.activity.watch('count', lang.hitch(this, function () {
                if (this.activity.get('count') > 0) {
                    this.map.showLoader();
                    return;
                }

                this.map.hideLoader();
            }));

            this.identifyTopic = this.map.on('click', lang.hitch(this, function (evt) {
                console.warn('this.map.on.click.topic.publish');
                topic.publish('app/identify-click', evt);
            }));

            this.own(
                this.map.on('load', lang.hitch(this, function () {
                    this.addGraphicLayers();
                })),
                this.identifyTopic,
                this.zoomCoords.on('zoom', lang.hitch(this, 'showPoint')),
                topic.subscribe('map-activity', lang.hitch(this, function (difference) {
                    var currentCount = this.activity.get('count');
                    var count = currentCount += difference;

                    this.activity.set('count', count);
                })),
                on(this.changeRequest, 'drawStart', lang.hitch(this, function () {
                    topic.publish('app/toolbar', 'redlining');
                    this.identifyTopic.remove();
                    this.identifyTopic = null;
                    var ddl = $('#suggest-change-dropdown');
                    ddl.dropdown('toggle');
                    ddl.blur();
                    $('.dropdown').blur();
                })),
                on(this.changeRequest, 'drawEnd', lang.hitch(this, function () {
                    $('#suggest-change-dropdown').dropdown('toggle');
                    var self = this;
                    this.identifyTopic = this.map.on('click', lang.hitch(self, function (evt) {
                        topic.publish('app/identify-click', evt);
                    }));
                })),
                aspect.before(this.sideBar, 'show', function () {
                    topic.publish('app/state', 'Fill out the address details for this point.');
                }),
                aspect.after(this.findAddress, '_done', lang.hitch(this, function () {
                    $('<div id="find-dropdown"></div>').dropdown('toggle');
                }))
            );
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                console.log('widget.declaredClass', widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        addGraphicLayers: function () {
            console.info('app.App::addGraphicLayers', arguments);

            if (this.editLayer && this.editLayer.getMap()) {
                if (this.labelLayer.featureLayers.length > 0) {
                    this.labelLayer.removeFeatureLayer(this.editLayer);
                }
                this.map.removeLayer(this.editLayer);
            }
            if (this.labelLayer && this.labelLayer.getMap()) {
                this.map.removeLayer(this.labelLayer);
            }

            this.labelLayer.addFeatureLayer(this.editLayer, this.labelRenderer, this.labelExpression);

            this.map.addLayer(this.searchGraphics, 0);
            this.map.addLayer(this.editLayer, 2);
            //this.map.addLayer(this.labelLayer, 1);

            this.initEditing(this.editLayer.id === 'editLayer');
        },
        enableEditingLayer: function () {
            // summary:
            //      removes the default viewing layer and adds the editing layer
            //
            console.log('app.App::enableEditingLayer', arguments);

            if (this.editLayer && this.editLayer.getMap()) {
                if (this.labelLayer.featureLayers.length > 0) {
                    this.labelLayer.removeFeatureLayer(this.editLayer);
                }
                this.map.removeLayer(this.editLayer);
            }

            var layerId = 0;

            var url = window.AGRC.urls.editLayer + layerId;
            this.editLayer = new FeatureLayer(url, {
                mode: FeatureLayer.MODE_ONDEMAND,
                useMapTime: false,
                outFields: ['*'],
                id: 'editLayer',
                minScale: 144448
            });

            var editingSelectionSymbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color('black'), 1),
                new Color('aqua')
            );

            this.editLayer.setSelectionSymbol(editingSelectionSymbol);

            this.addGraphicLayers();
        },
        initEditing: function (isEditable) {
            // sumamry:
            //      initializes the editing settings/widget
            // isEditable: creates attribute editor in read only mode
            console.info('app.App::initEditing', arguments);

            if (this.attributeEditor) {
                this.attributeEditor.destroyRecursive();
            }

            this.own(
                this.attributeEditor = new AttributeEditor({
                    sideBar: this.sideBar,
                    editLayer: this.editLayer,
                    map: this.map
                })
            );

            // show editor if logged in
            if (config.user) {
                this.own(
                    this.editor = new Editor({
                        map: this.map,
                        editLayer: this.editLayer
                    }, domConstruct.place('<div>', this.map.container, 'last'))
                );
            }

            this.attributeEditor.initialize(this.editLayer, isEditable);
        },
        showPoint: function (evt) {
            // summary:
            //      shows the point for a duration and hides the dropdown
            // evt
            console.log('app.App::showPoint', arguments);

            var symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color('#F012BE'), 1),
                new Color('#7FDBFF')
            );

            this._graphic = new Graphic(evt.point, symbol);
            this.searchGraphics.add(this._graphic);

            domClass.remove(this.zoomDropdown, 'open');

            var self = this;

            this.timeout = setTimeout(function () {
                if (self._graphic) {
                    self.searchGraphics.remove(self._graphic);
                    clearTimeout(self.timeout);
                }
            }, 5000);
        }
    });
});
