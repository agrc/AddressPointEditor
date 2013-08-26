define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/_base/event',

        'dojo/dom',
        'dojo/on',
        'dojo/aspect',
        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-attr',
        'dojo/Stateful',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/layout/StackContainer',
        'dijit/layout/ContentPane',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/DownloadSelector.html',
        'agrc/modules/JSONLoader!app/data/counties.json'
    ],

    function(
        declare,
        lang,
        array,
        event,

        dom,
        on,
        aspect,
        domClass,
        domConstruct,
        domAttr,
        Stateful,

        _WidgetBase,
        _TemplatedMixin,
        StackContainer,
        ContentPane,
        _WidgetsInTemplateMixin,

        template,

        counties
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("app.downloadSelector", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
            baseClass: 'download-selector',

            widgetsInTemplate: true,

            templateString: template,

            // the template page that is visible
            currentPage: 0,

            download: null,

            _setPostUrlAttr: {
                node: 'downloadForm',
                type: 'attribute',
                attribute: 'action'
            },
            _setSystemAttr: {
                node: 'systemHidden',
                type: 'attribute',
                attribute: 'value'
            },
            _setTypeAttr: {
                node: 'typeHidden',
                type: 'attribute',
                attribute: 'value'
            },
            _setCountyAttr: {
                node: 'countyHidden',
                type: 'attribute',
                attribute: 'value'
            },
            constructor: function() {
                console.info(this.declaredClass + "::constructor", arguments);
            },
            postCreate: function() {
                // summary:
                //      dom is ready
                console.info(this.declaredClass + "::postCreate", arguments);

                this.inherited(arguments);

                this.download = new Stateful({
                    system: null,
                    type: null,
                    county: null
                });

                this.download.watch("system", lang.hitch(this, 'updateHiddenValues'));
                this.download.watch("type", lang.hitch(this, 'updateHiddenValues'));
                this.download.watch("county", lang.hitch(this, 'updateHiddenValues'));

                this.pages = [this.cp1, this.cp2, this.cp3];

                this.hydrateCountySelect();

                this.sc.startup();
            },
            updateHiddenValues: function (prop, oldValue, newValue) {
                // summary:
                //      updates the hidden inputs for the form post
                // param: type or return: type
                console.log(this.declaredClass + "::updateHiddenValues", arguments);
             
                this.set(prop, newValue);
            },
            showNextPage: function() {
                console.info(this.declaredClass + "::showNextPage", arguments);

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
                console.info(this.declaredClass + "::back", arguments);

                if (this.currentPage > 0) {
                    this.currentPage--;
                }

                if (this.currentPage === 0) {
                    domClass.add(this.backButton, 'hidden');
                }

                this.sc.selectChild(this.pages[this.currentPage]);
            },
            setDownloadFilter: function(evt) {
                console.info(this.declaredClass + "::setDownloadFilter", arguments);

                var node = evt.target,
                    prop = node.getAttribute("data-prop"),
                    value = null;

                value = node.getAttribute("data-" + prop);

                if (prop === 'county') {
                    value = node.value;
                }

                this.download.set(prop, value);
                this.showNextPage();

                this.showDownloadButton();
            },
            showDownloadButton: function() {
                console.info(this.declaredClass + "::showDownloadButton", arguments);

                if (!this.valid()) {
                    domClass.add(this.submitButton, 'hidden');
                    domAttr.set(this.submitButton, 'disabled', true);

                    return;
                }

                domClass.remove(this.submitButton, 'hidden');
                domAttr.set(this.submitButton, 'disabled', false);

                this.set('postUrl', '/download');
            },
            hydrateCountySelect: function() {
                console.log(this.declaredClass + "::hydrateCountySelect", arguments);

                var countyNames = counties.result.sort(
                    function(a, b) {
                        a = a.attributes.name;
                        b = b.attributes.name;

                        if (a > b)
                            return 1;
                        if (a < b)
                            return -1;

                        return 0;
                    });

                array.forEach(countyNames,
                    function(v) {
                        domConstruct.create('option', {
                            value: v.attributes.name,
                            innerHTML: v.attributes.name.replace(/\w\S*/g, function(txt) {
                                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                            })
                        }, this.countySelect);
                    }, this);
            },
            validate: function(evt) {
                console.info(this.declaredClass + "::validate", arguments);

                if (!this.valid()) {
                    domClass.add(this.submitButton, 'hidden');
                    domAttr.set(this.submitButton, 'disabled', true);

                    event.stop(evt);
                    return;
                }
            },
            valid: function() {
                // summary:
                //      validates the download object
                console.log(this.declaredClass + "::valid", arguments);

                var props = ['system', 'type', 'county'];
                return array.every(props, function(item) {
                    return !!this.download.get(item);
                }, this);
            }
        });
    });