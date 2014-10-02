define([
    'dojo/_base/declare',
    'dojo/_base/fx',

    'dojo/dom-geometry',

    'dojo/text!app/templates/SlideInSidebar.html',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin'
], function(
    declare,
    fx,

    domGeom,

    template,

    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'slide-in-sidebar',

        constructor: function() {
            console.log('app.SlideInSidebar::constructor', arguments);
        },
        postCreate: function() {
            // summary:
            //      dom is ready
            console.log('app.SlideInSidebar::postCreate', arguments);

            this.inherited(arguments);

            this.wireEvents();

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
        wireEvents: function() {
            // param: type or return: type
            console.log('app.SlideInSidebar::wireEvents', arguments);

        },
        show: function() {
            // summary:
            //      description
            console.log('app.SlideInSidebar::show', arguments);

            this.showAni.play();
        },
        hide: function() {
            // summary:
            //      description
            console.log('app.SlideInSidebar::hide', arguments);

            this.hideAni.play();
        }
    });
});
