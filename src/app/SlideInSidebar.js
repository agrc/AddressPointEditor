define([
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/_base/fx',
        'dojo/_base/window',
        
        'dojo/dom-geometry',
        'dojo/dom-style',
        
        'dojo/topic',
        
        'dojo/text!app/templates/SlideInSidebar.html',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin'
    ],

    function(
        declare,
        array,
        lang,
        fx,
        win,
        
        domGeom,
        domStyle,

        topic, 

        template,

        _WidgetBase,
        _TemplatedMixin,
        _WidgetsInTemplateMixin
    ) {
        // summary:
        //      Handles retrieving and displaying the data in the popup.
        return declare("ijit.SlideInSidebar", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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

                this.resize();

                this.width = domGeom.getMarginBox(this.domNode).w;

                this.showAni = fx.animateProperty({
                        node: this.domNode,
                        properties: {
                            right: '0'
                        }
                    });

                this.hideAni = fx.animateProperty({
                        node: this.domNode,
                        properties: {
                            right: '-' + this.width
                        }
                    });
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

                topic.subscribe('window/resize', lang.hitch(this, 'resize'));
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