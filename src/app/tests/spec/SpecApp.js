define([
    'intern!object',
    'intern/chai!assert',
    'app/App',
    'dojo/dom-construct',
    'dojo/_base/window',

    'app/main'

],

function (
    registerSuite,
    assert,
    App,
    domConstruct,
    win
    ) {
    var testWidget;
    // override alert to console
    window.alert = function(msg) {
        console.error('ALERT OVERRIDDEN TO LOG: ' + msg);
    };

    registerSuite({
        name: 'app/App', 

        beforeEach: function () {
            testWidget = new App({}, domConstruct.create('div', {}, win.body()));
        },

        afterEach: function () {
            testWidget.destroy();
            testWidget = null;
        },

        creates_a_valid_object: function () {
            assert.equal(testWidget.declaredClass, 'app/App');
        }
    });
});