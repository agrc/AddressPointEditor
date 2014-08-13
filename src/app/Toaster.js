define([
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/text!./templates/Toaster.html',

    'dojo/topic',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin'

], function(
    declare,
    lang,

    template,

    topic,

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

            this.set('message', 'Welcome to the address point editor.');
            this.own(
                topic.subscribe('app/toolbar', lang.hitch(this, 'updateMessage')),
                topic.subscribe('app/state', lang.hitch(this, 'updateMessage'))
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
                    if(message.domNode){
                        this.set('message', '');
                        this.messageNode.appendChild(message.domNode);
                        return;
                    }

                    this.set('message', message);
            }
        },
        remove: function() {
            // summary:
            //      description
            console.log('app.toaster::remove', arguments);

            this.destroy();
        }
    });
});