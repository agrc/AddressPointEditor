require([
    'app/AttributeCopyPaste',

    'esri/dijit/AttributeInspector',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    AttributeInspector,

    domConstruct
) {
    describe('app/AttributeCopyPaste', function() {
        var widget;
        var destroy = function(widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var create = function() {
            var attributeEditor = {
                on: function() {

                },
                next: function() {
                    return {
                        feature: {
                            attributes: {
                                name: 'value',
                                name2: 'value2'
                            }
                        }
                    };
                }
            };
            var featureLayer = {
                on: function() {

                }
            };

            widget = new WidgetUnderTest({
                attributeEditor: attributeEditor,
                featureLayer: featureLayer
            }, domConstruct.create('div', null, document.body));
        };

        beforeEach(function() {
            create();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a AttributeCopyPaste', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('clipboard', function() {
            it('values survive the widget being destroyed', function() {
                var test = 'something';

                widget.set('clipboard', test);
                expect(widget.get('clipboard')).toEqual(test);

                for (var i = 0; i <= 10; i++) {
                    destroy(widget);
                    create();

                    expect(widget.get('clipboard')).toEqual(test);
                }
            });
        });

        describe('paste', function () {
            it('pastes the clipboard data into form fields', function () {
                widget.paste();
            });
        });
    });
});