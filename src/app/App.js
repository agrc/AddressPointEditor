define([
    'dojo/text!./templates/App.html',

    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/declare',
    'dojo/_base/Color',
    'dojo/_base/event',

    'dojo/dom',
    'dojo/on',
    'dojo/aspect',
    'dojo/topic',
    'dojo/Stateful',

    'dojo/dom-construct',
    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'dijit/registry',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMapSelector',

    'ijit/widgets/notify/ChangeRequest',
    'ijit/widgets/authentication/LoginRegister',

    'esri/layers/FeatureLayer',
    'esri/config',
    'esri/tasks/GeometryService',
    'esri/geometry/Extent',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleLineSymbol',

    './config',
    './SlideInSidebar',
    './DownloadSelector',
    './Editor',
    './AttributeEditor',
    './Toaster',
    './ParcelIdentify',


    'bootstrap'
], function(
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
    Stateful,

    domConstruct,
    domClass,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    registry,

    BaseMap,
    FindAddress,
    MagicZoom,
    BaseMapSelector,

    ChangeRequest,
    LoginRegister,

    FeatureLayer,
    esriConfig,
    GeomService,
    Extent,
    SimpleMarkerSymbol,
    SimpleLineSymbol,

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

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::App', arguments);

            esriConfig.app = this;

            this.childWidgets = [];
        },
        postCreate: function() {
            // summary:
            //      Fires when
            console.log('app.App::App', arguments);

            var that = this;
            topic.subscribe(LoginRegister.prototype.topics.signInSuccess, function(result) {
                window.AGRC.user = result.user;

                that.addFeatureLayer();
            });

            this.activity = new Stateful({
                count: 0
            });

            this.initMap();

            this.addFeatureLayer();

            this.childWidgets.push(
                new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    showOnLoad: false,
                    securedServicesBaseUrl: config.urls.featureLayer
                }),
                this.findAddress = new FindAddress({
                    map: this.map,
                    apiKey: AGRC.apiKey
                }, this.findAddressDiv),
                this.magicZoom = new MagicZoom({
                    map: this.map,
                    mapServiceURL: AGRC.urls.basemap,
                    searchLayerIndex: 3,
                    searchField: 'Name',
                    maxResultsToDisplay: 10
                }, this.magicZoomDiv),
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
                }, this.parcelIdentifyNode)
            );

            this.wireEvents();
        },
        wireEvents: function() {
            console.log('app.App::App', arguments);

            this.activity.watch('count', lang.hitch(this, function() {
                if (this.activity.get('count') > 0) {
                    this.map.showLoader();
                    return;
                }

                this.map.hideLoader();
            }));

            this.own(
                this.map.on('layers-add-result', lang.hitch(this, 'initEditing')),
                topic.subscribe('map-activity', lang.hitch(this, function(difference) {
                    var currentCount = this.activity.get('count');
                    var count = currentCount += difference;

                    this.activity.set('count', count);
                })),
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
                }),
                aspect.before(this.sideBar, 'show', function() {
                    topic.publish('app/state', 'Fill out the address details for this point.');
                }),
                aspect.after(this.findAddress, 'done', lang.hitch(this, function() {
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
            console.info('app.App::App', arguments);

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

            esriConfig.defaults.geometryService = new GeomService(AGRC.urls.geometryService);
        },
        addFeatureLayer: function() {
            console.info('app.App::App', arguments);

            var id = 0;

            if (id < 0) {
                return;
            }

            if (this.editLayer) {
                this.map.removeLayer(this.editLayer);
            }

            var url = (config.user) ? AGRC.urls.editLayer : AGRC.urls.viewLayer;
            this.editLayer = new FeatureLayer(url + id, {
                mode: FeatureLayer.MODE_ONDEMAND,
                useMapTime: false,
                outFields: ['*']
            });

            var symbol = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE, 8,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color('black'), 1),
                new Color('aqua')
            );

            this.editLayer.setSelectionSymbol(symbol);

            this.map.addLayers([this.editLayer]);
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function(widget) {
                console.log('widget.declaredClass', widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.inherited(arguments);
        },
        initEditing: function(evt) {
            // sumamry:
            //      initializes the editing settings/widget
            console.info('app.App::App', arguments);

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

            this.attributeEditor.initialize(evt.layers[0].layer);
        }
    });
});