define([
    'dojo/text!./templates/Toaster.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/topic',

    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'

], function(
    template,

    declare,
    lang,

    topic,

    domClass,

    _WidgetBase,
    _TemplatedMixin
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        baseClass: 'alert alert-info alert-dismissable toaster',
        templateString: template,

        //messageNode: dom/node,

        _setMessageAttr: {
            node: 'messageNode',
            type: 'innerHTML'
        },

        constructor: function() {
            // summary:
            //      duh
            console.log('app.toaster::constructor', arguments);

        },
        postCreate: function() {
            // summary:
            //      setup
            console.log('app.toaster::postCreate', arguments);

            this.set('message', 'Welcome to the address point editor. ' +
                'Did you know you can click on a parcel to identify?');
            this.own(
                topic.subscribe('app/toolbar', lang.hitch(this, 'updateMessage')),
                topic.subscribe('app/state', lang.hitch(this, 'updateMessage')),
                topic.subscribe('app/identify', lang.hitch(this, 'showIdentify'))
            );
        },
        updateMessage: function(message) {
            // summary:
            //      sets the toaster text
            // message: string to display
            console.log('app.toaster::updateMessage', arguments);

            switch (message) {
                case 'drawing':
                    this.set('message', 'Click on the map to create a new point.' +
                        ' When you are done, fill out the attributes.');
                    break;
                case 'navigation':
                    this.set('message', 'Click on a point to edit the attributes or' +
                        ' remove the point. Use <code>Point</code> to add new points ' +
                        'or <code>Move</code> to enable point relocating.');
                    break;
                case 'editing-started':
                    this.set('message', 'Hover over a point and drag it to its new ' +
                        'location. Click <code>Move</code> again to end your session.');
                    break;
                case 'editing':
                    this.set('message', 'Drag the yellow point to where it belongs. ' +
                        'Click <code>Save</code> if you are done.');
                    break;
                default:
                    this.set('message', message);
            }
        },
        showIdentify: function(identifyWidget) {
            // summary:
            //      makes sure the toaster displays itself
            // identifyNode
            console.log('app.toaster::showIdentify', arguments);

            if (!identifyWidget.domNode) {
                return;
            }

            this.set('message', null);
            this.messageNode.appendChild(identifyWidget.domNode);
            domClass.replace(this.domNode, 'show', 'hide');
        },
        remove: function() {
            // summary:
            //      description
            console.log('app.toaster::remove', arguments);

            this._hide();
        },
        _hide: function() {
            // summary:
            //      hide's the toaster.
            //
            console.log('app.toaster::_hide', arguments);

            domClass.replace(this.domNode, 'hide', 'show');
        }
    });
});