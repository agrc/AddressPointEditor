require([
    'app/AttributeCopyPaste',

    'esri/dijit/AttributeInspector',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    AttributeInspector,

    domConstruct
) {
    describe('app/AttributeCopyPaste', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var create = function () {
            var attributeEditor = {
                on: function () {

                },
                next: function () {
                    return {
                        feature: {
                            attributes: {
                                name: 'value',
                                name2: 'value2'
                            }
                        }
                    };
                },
                editButtons: domConstruct.create('div')
            };
            var featureLayer = {
                on: function () {

                }
            };

            widget = new WidgetUnderTest({
                attributeEditor: attributeEditor,
                featureLayer: featureLayer
            }, domConstruct.create('div', null, document.body));
        };

        beforeEach(function () {
            create();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a AttributeCopyPaste', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('clipboard', function () {
            it('values survive the widget being destroyed', function () {
                var test = 'something';

                widget.set('clipboard', test);
                expect(widget.get('clipboard')).toEqual(test);

                for (var i = 0; i <= 10; i++) {
                    destroy(widget);
                    create();

                    expect(widget.get('clipboard')).toEqual(test);
                }
            });
            it('removes the ignorefields', function () {
                widget.set('clipboard', {
                    'OBJECTID': 1,
                    'Editor': 'me',
                    'LoadDate': 123123123,
                    'ModifyDate': 2342341234,
                    'AddNum': '123',
                    'AddNumSuffix': 'E',
                    'ValidProp': true
                });

                var actual = widget.get('clipboard');

                var numberOfProps = 0;
                for (var prop in actual) {
                    if (actual.hasOwnProperty(prop)) {
                        numberOfProps = numberOfProps + 1;
                    }
                }

                expect(numberOfProps).toEqual(1);

                expect(actual).toEqual({
                    'ValidProp': true
                });
            });
            it('removes the ignorefields from copy', function () {
                widget.data = {
                    'OBJECTID': 1,
                    'Editor': 'me',
                    'LoadDate': 123123123,
                    'ModifyDate': 2342341234,
                    'AddNum': '123',
                    'AddNumSuffix': 'E',
                    'ValidProp': true
                };

                widget.copy();

                var actual = widget.get('clipboard');

                var numberOfProps = 0;
                for (var prop in actual) {
                    if (actual.hasOwnProperty(prop)) {
                        numberOfProps = numberOfProps + 1;
                    }
                }

                expect(numberOfProps).toEqual(1);

                expect(actual).toEqual({
                    'ValidProp': true
                });
            });
        });

        describe('paste', function () {
            it('pastes the clipboard data into form fields', function () {
                spyOn(widget, '_setDijitValue');
                widget.fieldInfoMap = {
                    'ValidProp': {}
                };
                widget.set('clipboard', {
                    'OBJECTID': 1,
                    'Editor': 'me',
                    'LoadDate': 123123123,
                    'ModifyDate': 2342341234,
                    'AddNum': '123',
                    'AddNumSuffix': 'E',
                    'ValidProp': true
                });

                widget.paste();

                expect(widget._setDijitValue).toHaveBeenCalledWith('ValidProp', true);
            });
        });
    });
});
