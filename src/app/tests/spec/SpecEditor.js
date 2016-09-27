require([
    'dojo/dom-construct',
    'dojo/dom-class',

    'app/Editor',
    'app/config'
],

    function (
        domConstruct,
        domClass,

        Editor,
        config
    ) {
        var fn = config.fieldNames;
        var testWidget;
        var mockMap = {
            loaded: true
        };
        var mockFeaturelayer = {
            applyEdits: function () {
                return {
                    then: function () {}
                };
            }
        };
        var mockGraphic = {
            setGeometry: function () {
                return true;
            },
            setAttributes: function () {
                return true;
            },
            geometry: {
                toJson: function () {
                    return '';
                }
            }
        };

        describe('app/Editor', function () {
            beforeEach(function () {
                testWidget = new Editor({
                    map: mockMap,
                    editLayer: mockFeaturelayer
                }, domConstruct.create('div', {}, document.body));
            });

            afterEach(function () {
                testWidget.destroy();
                testWidget = null;
            });

            it('creates_a_valid_object', function () {
                expect(testWidget).toEqual(jasmine.any(Editor));
            });

            it('bug_17', function () {
                //operationType, graphic, original
                testWidget.addUndoState('update', mockGraphic, mockGraphic);

                testWidget.undo();
                testWidget.undo();

                expect(domClass.contains(testWidget.undoNode, 'disabled')).toBe(true);
            });

            describe('addUndoState', function () {
                it('enables undo button', function () {
                    testWidget.addUndoState('update', mockGraphic, mockGraphic);

                    expect(domClass.contains(testWidget.undoNode, 'disabled')).toBe(false);
                });
            });
            describe('undo', function () {
                it('disables undo button if there are no more operations to undo', function () {
                    domClass.remove(testWidget.undoNode, 'disabled');
                    testWidget.undoManager.canUndo = true;

                    testWidget.undo();

                    expect(domClass.contains(testWidget.undoNode, 'disabled')).toBe(true);

                    testWidget.undoManager.canUndo = false;
                    testWidget.undo();

                    expect(domClass.contains(testWidget.undoNode, 'disabled')).toBe(true);
                });
                it('enables redo button', function () {
                    domClass.add(testWidget.undoNode, 'disabled');

                    testWidget.undo();

                    expect(domClass.contains(testWidget.redoNode, 'disabled')).toBe(true);
                });
            });
            describe('updateUndoRedoCounts', function () {
                it('shows correct counts when there is no available undos', function () {
                    testWidget.undoManager.length = 0;

                    testWidget.updateUndoRedoCounts();

                    expect(testWidget.undoCount).toBe('');
                    expect(testWidget.redoCount).toBe('');
                });
                it('shows the correct counts when there are 3 undos but none have been undone', function () {
                    testWidget.undoManager.length = 3;
                    testWidget.undoManager.position = 3;

                    testWidget.updateUndoRedoCounts();

                    expect(testWidget.undoCount).toBe(3);
                    expect(testWidget.redoCount).toBe('');
                });
                it('shows the correct counts when there are 3 undos and 2 have been undone', function () {
                    testWidget.undoManager.length = 3;
                    testWidget.undoManager.position = 1;

                    testWidget.updateUndoRedoCounts();

                    expect(testWidget.undoCount).toBe(1);
                    expect(testWidget.redoCount).toBe(2);
                });
                it('shows the correct counts when there are 3 undos and 3 have been undone', function () {
                    testWidget.undoManager.length = 3;
                    testWidget.undoManager.position = 0;

                    testWidget.updateUndoRedoCounts();

                    expect(testWidget.undoCount).toBe('');
                    expect(testWidget.redoCount).toBe(3);
                });
            });
            describe('applyEditTracking', function () {
                it('adds user name and dates to passed in graphics', function () {
                    var edits = {
                        updates: [{
                            attributes: {}
                        },{
                            attributes: {}
                        }]
                    };
                    var email = 'blah1';
                    window.AGRC.user = {
                        email: email
                    };

                    testWidget.applyEditTracking(edits);

                    expect(edits.updates[0].attributes[fn.Editor]).toEqual(email);
                    expect(edits.updates[1].attributes[fn.ModifyDate]).toBeDefined();
                });
            });
        });
    });
