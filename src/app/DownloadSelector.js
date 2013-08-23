define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',

        'dojo/dom',
        'dojo/on',
        'dojo/aspect',
        'dojo/dom-class',
        'dojo/dom-construct',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/layout/StackContainer',
        'dijit/layout/ContentPane',

        'dojo/text!app/templates/DownloadSelector.html',
        'dojo/text!app/templates/DownloadCoordinateSystem.html',
        'dojo/text!app/templates/DownloadFileType.html',
        'dojo/text!app/templates/DownloadCounty.html',

        'mustache/mustache'
    ],

    function(
        declare,
        lang,
        array,

        dom,
        on,
        aspect,
        domClass,
        domConstruct,

        _WidgetBase,
        _TemplatedMixin,
        StackContainer,
        ContentPane,

        template,
        page1,
        page2,
        page3,

        mustache
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.downloadSelector", [_WidgetBase, _TemplatedMixin], {
            baseClass: 'download-selector',

            templateString: template,

            // the template page that is visible
            currentPage: 0,

            download: null,

            constructor: function() {
                console.log(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.log(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.download = {};

                this.coordinateTemplate = domConstruct.toDom(mustache.compile(page1)({
                    id: this.id
                }));
                this.fileTypeTemplate = domConstruct.toDom(mustache.compile(page2)({
                    id: this.id
                }));
                this.countyTemplate = domConstruct.toDom(mustache.compile(page3)({
                    id: this.id,
                    county: ['Salt Lake', 'Provo']
                }));

                this.sc = new StackContainer({}, this.wizardNode);
                var cp1 = new ContentPane({
                    content: this.coordinateTemplate
                }),
                    cp2 = new ContentPane({
                        content: this.fileTypeTemplate
                    }),
                    cp3 = new ContentPane({
                        content: this.countyTemplate
                    });

                this.pages = [cp1, cp2, cp3];

                this.sc.addChild(cp1);
                this.sc.addChild(cp2);
                this.sc.addChild(cp3);

                this.sc.startup();

                this.wireEvents();
            },
            wireEvents: function() {
                console.log(this.declaredClass + "::wireEvents", arguments);

                this.own(
                    on(dom.byId(this.id + '_stateplain_north'), 'click', lang.hitch(this, lang.partial(this.setDownloadFilter, 'system', 'state_plain_north'))),
                    on(dom.byId(this.id + '_stateplain_central'), 'click', lang.hitch(this, lang.partial(this.setDownloadFilter, 'system', 'state_plain_central'))),
                    on(dom.byId(this.id + '_stateplain_south'), 'click', lang.hitch(this, lang.partial(this.setDownloadFilter, 'system', 'state_plain_south'))),
                    on(dom.byId(this.id + '_utm_zone12n'), 'click', lang.hitch(this, lang.partial(this.setDownloadFilter, 'system', 'utm12')))
                );

                this.own(
                    on(dom.byId(this.id + '_shapefile'), 'click', lang.hitch(this, lang.partial(this.setFileType, 'type', 'shapefile'))),
                    on(dom.byId(this.id + '_fgdb'), 'click', lang.hitch(this, lang.partial(this.setDownloadFilter, 'type', 'fgdb')))
                );

                this.own(
                    on(dom.byId(this.id + '_county'), 'change', lang.hitch(this, lang.partial(this.setDownloadFilter, 'county')))
                );
            },
            showNextPage: function() {
                console.log(this.declaredClass + "::showNextPage", arguments);

                if (this.currentPage < 0) {
                    domClass.add(this.backButton, 'hidden');
                    this.sc.selectChild(this.pages[0]);

                    return;
                }

                if (this.currentPage < this.pages.length - 1) {
                    this.currentPage++;
                }

                domClass.remove(this.backButton, 'hidden');

                this.sc.selectChild(this.pages[this.currentPage]);
            },
            back: function() {
                console.log(this.declaredClass + "::back", arguments);

                if (this.currentPage > 0) {
                    this.currentPage--;
                }

                if (this.currentPage === 0) {
                    domClass.add(this.backButton, 'hidden');
                }

                this.sc.selectChild(this.pages[this.currentPage]);
            },
            setDownloadFilter: function(prop, value) {
                console.log(this.declaredClass + "::setDownloadFilter", arguments);

                if(value && value.target)
                {
                    value = value.target.value;
                }

                this.download[prop] = value;
                this.showNextPage();

                this.showDownloadButton();
            },
            showDownloadButton: function(){
                console.log(this.declaredClass + "::showDownloadButton", arguments);

                var props = ['system', 'type', 'county'];
                if(array.every(props, function(item){
                    return item;
                },this))
                {
                    console.log('show download button');
                }
            },
            requestDownload: function() {
                console.log(this.declaredClass + "::requestDownload", arguments);

            }

        });
    });