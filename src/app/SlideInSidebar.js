define([
        'dojo/_base/declare',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',

        'dojo/text!app/templates/SlideInSidebar.html',
        'esri/request',

        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/on',
        'dojo/dom-class',

        'esri/domUtils',

        'dojo/_base/fx',
        'dojo/fx',
        'dojo/dom-geometry',
        'dojo/_base/window',
        'dojo/dom-style'
    ],

    function(
        declare,
        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin,
        template,
        esriRequest,
        array,
        lang,
        on,
        domClass,
        domUtils,
        fx,
        coreFx,
        domGeom,
        win,
        domStyle
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare(
            [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
                widgetsInTemplate: true,
                templateString: template,
                baseClass: 'slide-in-sidebar',

                constructor: function() {
                    console.log(this.declaredClass + "::constructor", arguments);
                },
                postCreate: function() {
                    // summary:
                    //      dom is ready
                    console.log(this.declaredClass + "::postCreate", arguments);

                    this.inherited(arguments);

                    this.wireEvents();

                    // manually set display to none to make sure that slider
                    // gets initialized correctly
                    domUtils.hide(this.calculationsDiv);

                    this.resize();

                    this.width = domGeom.getMarginBox(this.domNode).w;
                    var that = this;
                    this.showAni = coreFx.combine([
                        fx.animateProperty({
                            node: this.domNode,
                            properties: {
                                right: '0'
                            }
                        }),
                        fx.animateProperty({
                            node: this.map.container,
                            properties: {
                                width: (domGeom.getMarginBox(this.map.container).w - this.width).toString()
                            },
                            onEnd: function() {
                                that.map.resize(true);

                                that.map.setExtent(that.map.graphics.graphics[0].geometry.getExtent(), true);
                            }
                        })
                    ]);
                    this.hideAni = coreFx.combine([
                        fx.animateProperty({
                            node: this.domNode,
                            properties: {
                                right: '-' + this.width
                            }
                        }),
                        fx.animateProperty({
                            node: this.map.container,
                            properties: {
                                width: {
                                    start: ((domGeom.getMarginBox(this.map.container).w /
                                        domGeom.getMarginBox(win.body()).w) * 100).toString(),
                                    end: '100',
                                    units: '%'
                                }
                            },
                            onEnd: function() {
                                that.map.resize(true);
                            }
                        })
                    ]);
                },
                resize: function() {
                    // summary:
                    //      resets the height of the div
                    console.log(this.declaredClass + "::resize", arguments);

                    domStyle.set(this.domNode, 'height', (domGeom.getMarginBox(win.body()).h - 41) + 'px');
                },
                wireEvents: function() {
                    // param: type or return: type
                    console.log(this.declaredClass + "::wireEvents", arguments);

                },
                show: function() {
                    // summary:
                    //      description
                    console.log(this.declaredClass + "::show", arguments);

                    this.showAni.play();
                },
                hide: function() {
                    // summary:
                    //      description
                    console.log(this.declaredClass + "::hide", arguments);

                    this.hideAni.play();
                }
            });
    });