define([
    'dijit/registry',
    'dojo/dom',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/App.html',
    'agrc/widgets/map/BaseMap',
    'ijit/modules/ErrorLogger',
    'ijit/widgets/layout/SideBarToggler',
    'ijit/widgets/layout/PaneStack',
    'dojo/on',
    'dojo/_base/array',
    'dojo/_base/lang',
    'esri/dijit/editing/Editor',
    'esri/dijit/AttributeInspector',
    'esri/layers/FeatureLayer',
    'esri/config',
    'esri/tasks/GeometryService',
    'dojo/dom-construct',
    'dijit/TitlePane',
    'agrc/widgets/locate/FindGeneric',

    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane'],

function(
registry,
dom,
declare,
_WidgetBase,
_TemplatedMixin,
_WidgetsInTemplateMixin,
template,
BaseMap,
ErrorLogger,
SideBarToggler,
PaneStack,
on,
array,
lang,
editor,
attributeEditor,
featureLayer,
config,
geomService,
construct,
titlePane,
findGeneric) {
    return declare("app.App", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        constructor: function() {
            // summary:
            //      first function to fire after page loads
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // esri.config.defaults.io.corsEnabledServers.push("dagrc.utah.gov");

            AGRC.errorLogger = new ErrorLogger({
                appName: 'Broadband.Editing'
            });

            AGRC.app = this;
        },
        postCreate: function() {
            // summary:
            //      Fires when 
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // set version number
            this.version.innerHTML = AGRC.version;
        },
        startup: function() {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // call this before creating the map to make sure that the map container is 
            // the correct size
            this.inherited(arguments);

            this.paneStack = new PaneStack(null, this.paneStackContainer);

            this.initMap();

            new SideBarToggler({
                sidebar: this.sideBar.domNode,
                mainContainer: this.mainContainer,
                map: this.map,
                centerContainer: this.centerContainer.domNode
            }, this.sidebarToggle);
        },
        initMap: function() {
            // summary:
            //      Sets up the map
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.map = new BaseMap(this.mapDiv, {
                defaultBaseMap: 'Lite'
            });

            on(this.map, 'Load', lang.hitch(this, 'mapLoad'));
            on(this.map, "LayersAddResult", lang.hitch(this, 'initEditing'));

            config.defaults.geometryService = new geomService("http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer");
        },
        mapLoad: function() {
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            this.determineCounty();
        },
        determineCounty: function() {
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            var finder = new findGeneric({
                map: this.map,
                layerName: 'SGID10.BOUNDARIES.Counties',
                searchFieldName: 'NAME',
                label: 'County',
                fieldLabel: 'Name'
            });

            this.countypane = new titlePane({
                title: "Choose a County",
                content: finder,
                open: true
            });

            this.paneStack.add(this.countypane);

            on(finder, 'Find', lang.hitch(this, 'addFeatureLayer'));
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
                mode: featureLayer.MODE_ONDEMAND
            });

            this.map.addLayers([this.editLayer]);

            return true;
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

            var settings = {
                map: this.map,
                layerInfos: featureLayerInfos
            };

            var params = {
                settings: settings
            };

            var editorWidget = new editor(params);

            if (this.editingpane) 
                this.paneStack.remove(this.editingpane);

            this.editingpane = new titlePane({
                title: "Edit Address Points",
                content: editorWidget,
                open: true
            });

            this.countypane.toggle();
            this.paneStack.add(this.editingpane);

            editorWidget.startup();
        }
    });
});