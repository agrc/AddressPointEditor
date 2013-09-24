define([
        'dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/text!app/templates/Toaster.html',

        'dojo/topic',

        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin'

    ],
    function(
        declare,
        lang,

        template,

        topic,

        _WidgetBase,
        _TemplatedMixin
    ) {
        return declare("app.toaster", [_WidgetBase, _TemplatedMixin], {
            baseClass: 'toaster',
            templateString: template,

            //messageNode: dom/node,

            _setMessageAttr: {
                node: 'messageNode',
                type: 'innerHTML'
            },

            constructor: function() {
                // summary:
                //      duh
                console.log(this.declaredClass + "::constructor", arguments);

            },
            postCreate: function() {
                // summary:
                //      setup
                console.log(this.declaredClass + "::postCreate", arguments);

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
                console.log(this.declaredClass + "::updateMessage", arguments);

                switch (message) {
                    case "drawing":
                        this.set('message', "Click on the map to create a new point. When you are done, fill out the attributes.");
                        break;
                    case "navigation":
                        this.set('message', 'Click on a point to edit the attributes or remove the point. Use <code>Point</code> to add new points or <code>Move</code> to enable point relocating.');
                        break;
                    case "started.editing":
                        this.set('message', 'Hover over a point and drag it to its new location. Click <code>Move</code> again to end your session.');
                        break;
                    case "editing":
                        this.set('message', 'Drag the yellow point to where it belongs. Click <code>Save</code> if you are done.');
                        break;
                    default:
                        this.set('message', message);
                }
            },
            remove: function() {
                // summary:
                //      description
                console.log(this.declaredClass + "::remove", arguments);

                this.destroy();
            }
        });
    });