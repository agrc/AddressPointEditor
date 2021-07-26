require([
    'app/App',

    'dojo/dom-construct'
],

function (
    App,

    domConstruct
) {
    var testWidget;
    // override alert to console
    // window.alert = function(msg) {
    //     console.error('ALERT OVERRIDDEN TO LOG: ' + msg);
    // };

    describe('app/App', function () {
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, document.body));
        });

        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('createsAValidObject', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
    });
});
