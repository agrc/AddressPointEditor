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
        geomService) {
        return declare("app.App", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,
        
        constructor: function(){
            // summary:
            //      first function to fire after page loads
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // esri.config.defaults.io.corsEnabledServers.push("dagrc.utah.gov");
            
            AGRC.errorLogger = new ErrorLogger({appName: 'Broadband.Editing'});
            
            AGRC.app = this;
        },
        postCreate: function () {
            // summary:
            //      Fires when 
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // set version number
            this.version.innerHTML = AGRC.version;
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

            // call this before creating the map to make sure that the map container is 
            // the correct size
            this.inherited(arguments);
            
            var ps;
            var sb;

            ps = new PaneStack(null, this.paneStack);
            
            this.initMap();
            
            sb = new SideBarToggler({
                sidebar: this.sideBar.domNode,
                mainContainer: this.mainContainer,
                map: this.map,
                centerContainer: this.centerContainer.domNode
            }, this.sidebarToggle);
        },
        initMap: function(){
            // summary:
            //      Sets up the map
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            this.map = new BaseMap(this.mapDiv, {defaultBaseMap: 'Lite'});

            on(this.map, "LayersAddResult", lang.hitch(this, 'initEditing'));

            var editLayer = new featureLayer("/arcgis/rest/services/demo/AddressPoints_Kane/FeatureServer/0", {
                mode: featureLayer.MODE_ONDEMAND
            });

            console.log(editLayer.mode);

            this.map.addLayers([editLayer]);

            config.defaults.geometryService = new geomService("http://mapserv.utah.gov/ArcGIS/rest/services/Geometry/GeometryServer");
        },
        initEditing: function(results) {
            // sumamry:
            // initializes the editing settings/widget
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);

            var featureLayerInfos = array.map(results, function(result) {
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

            var editorWidget = new editor(params, this.editorContainer);
            editorWidget.startup();
        }
    });
});