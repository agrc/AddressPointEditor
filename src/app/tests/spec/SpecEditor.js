define([
    'intern!object',

    'intern/chai!assert',
    
    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/dom-class',

    'app/Editor'

],

function (
    registerSuite,
    assert,
    win,
    domConstruct,
    domClass,
    Editor
    ) {
    var testWidget;
    var mockMap = {
        loaded: true
    };

    registerSuite({
        name: 'app/Editor',

        beforeEach: function () {
            testWidget = new Editor({
                map: mockMap
            }, domConstruct.create('div', {}, win.body()));
        },
        afterEach: function () {
            testWidget.destroy();
            testWidget = null;
        },

        'creates_a_valid_object': function () {
            assert.equal(testWidget.declaredClass, 'app.editor');
        },

        'addUndoState': {
            'enables undo button': function () {
                testWidget.addUndoState([1,2,3]);

                assert.isFalse(domClass.contains(testWidget.undoNode, 'disabled'));
            }
        },
        'undo': {
            'disables undo button if there are no more operations to undo': function () {
                domClass.remove(testWidget.undoNode, 'disabled');
                testWidget.undoManager.canUndo = true;

                testWidget.undo();

                assert.isFalse(domClass.contains(testWidget.undoNode, 'disabled'));

                testWidget.undoManager.canUndo = false;
                testWidget.undo();

                assert.isTrue(domClass.contains(testWidget.undoNode, 'disabled'));
            },
            'enables redo button': function () {
                domClass.add(testWidget.undoNode, 'disabled');

                testWidget.undo();

                assert.isFalse(domClass.contains(testWidget.redoNode, 'disabled'));
            }
        },
        'updateUndoRedoCounts': {
            'shows correct counts when there is no available undos': function () {
                testWidget.undoManager.length = 0;

                testWidget.updateUndoRedoCounts();

                assert.strictEqual(testWidget.undoCount, '');
                assert.strictEqual(testWidget.redoCount, '');
            },
            'shows the correct counts when there are 3 undos but none have been undone': function () {
                testWidget.undoManager.length = 3;
                testWidget.undoManager.position = 3;

                testWidget.updateUndoRedoCounts();

                assert.strictEqual(testWidget.undoCount, 3);
                assert.strictEqual(testWidget.redoCount, '');
            },
            'shows the correct counts when there are 3 undos and 2 have been undone': function () {
                testWidget.undoManager.length = 3;
                testWidget.undoManager.position = 1;

                testWidget.updateUndoRedoCounts();

                assert.strictEqual(testWidget.undoCount, 1);
                assert.strictEqual(testWidget.redoCount, 2);
            },
            'shows the correct counts when there are 3 undos and 3 have been undone': function () {
                testWidget.undoManager.length = 3;
                testWidget.undoManager.position = 0;

                testWidget.updateUndoRedoCounts();

                assert.strictEqual(testWidget.undoCount, '');
                assert.strictEqual(testWidget.redoCount, 3);
            }
        }
    });
});