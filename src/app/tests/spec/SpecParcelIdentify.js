require([
    'app/ParcelIdentify',

    'dojo/dom-class',

    'stubmodule'
], function(
    ClassUnderTest,

    domClass,

    stubmodule
) {
    describe('app.ParcelIdentify', function() {
        var testWidget;
        var map;

        afterEach(function() {
            if (testWidget) {
                if (testWidget.destroy) {
                    testWidget.destroy();
                }

                testWidget = null;
            }
        });

        beforeEach(function() {
            map = jasmine.createSpyObj('map', ['on']);
            testWidget = new ClassUnderTest({
                map: map
            });
        });

        describe('Sanity', function() {
            it('should create a Identify', function() {
                expect(testWidget).toEqual(jasmine.any(ClassUnderTest));
                expect(testWidget.map).toBe(map);
            });
        });
        describe('getters and setters', function() {
            beforeEach(function() {
                testWidget._set('x', 1.23456);
                testWidget._set('y', 1.23456);
                testWidget._set('parcelId', 'blah');
                testWidget._set('address', 'blah');
                testWidget._set('city', 'blah');
                testWidget._set('zip', 'blah');
                testWidget._set('ownership', 'blah');
                testWidget._set('reverse', 'blah');
            });
            it('rounds utms to 2 decimal places', function() {
                expect(('' + testWidget.get('x')).split('.').length).toBe(2);
                expect(('' + testWidget.get('y')).split('.').length).toBe(2);
            });
            it('_reset all values', function() {
                testWidget._reset('reset');

                expect(testWidget.get('x')).toEqual('No data.');
                expect(testWidget.get('y')).toEqual('No data.');
                expect(testWidget.get('parcelId')).toEqual('No parcel data.');
                expect(testWidget.get('address')).toEqual('No parcel data.');
                expect(testWidget.get('city')).toEqual('No parcel data.');
                expect(testWidget.get('zip')).toEqual('No parcel data.');
                expect(testWidget.get('ownership')).toEqual('No parcel data.');
                expect(testWidget.get('reverse')).toEqual('No address found.');
            });
        });
        describe('_setValues', function() {
            beforeEach(function () {
                testWidget.mapPoint = {
                    x: 1,
                    y: 2
                };
            });
            it('handles null return', function() {
                testWidget._setValues(null);

                expect(testWidget.get('x')).toEqual(1);
                expect(testWidget.get('y')).toEqual(2);
                expect(testWidget.get('parcelId')).toEqual('No parcel data.');
                expect(testWidget.get('address')).toEqual('No parcel data.');
                expect(testWidget.get('city')).toEqual('No parcel data.');
                expect(testWidget.get('zip')).toEqual('No parcel data.');
                expect(testWidget.get('ownership')).toEqual('No parcel data.');
                expect(testWidget.get('reverse')).toEqual('No address found.');
            });
            it('handles empty array return', function() {
                testWidget._setValues([]);

                expect(testWidget.get('x')).toEqual(1);
                expect(testWidget.get('y')).toEqual(2);
                expect(testWidget.get('parcelId')).toEqual('No parcel data.');
                expect(testWidget.get('address')).toEqual('No parcel data.');
                expect(testWidget.get('city')).toEqual('No parcel data.');
                expect(testWidget.get('zip')).toEqual('No parcel data.');
                expect(testWidget.get('ownership')).toEqual('No parcel data.');
                expect(testWidget.get('reverse')).toEqual('No address found.');
            });
            it('handles empty array return', function() {
                testWidget._setValues([]);

                expect(testWidget.get('x')).toEqual(1);
                expect(testWidget.get('y')).toEqual(2);
                expect(testWidget.get('parcelId')).toEqual('No parcel data.');
                expect(testWidget.get('address')).toEqual('No parcel data.');
                expect(testWidget.get('city')).toEqual('No parcel data.');
                expect(testWidget.get('zip')).toEqual('No parcel data.');
                expect(testWidget.get('ownership')).toEqual('No parcel data.');
                expect(testWidget.get('reverse')).toEqual('No address found.');
            });
            it('handles valid return', function() {
                /*jshint -W106*/
                testWidget._setValues([{
                    attributes: {
                        parcel_id: 'id',
                        parcel_add: 'add',
                        parcel_city: 'city',
                        parcel_zip: 'zip',
                        own_type: 'type'
                    }
                }]);
                /*jshint +W106*/

                expect(testWidget.get('x')).toEqual(1);
                expect(testWidget.get('y')).toEqual(2);
                expect(testWidget.get('parcelId')).toEqual('id');
                expect(testWidget.get('address')).toEqual('add');
                expect(testWidget.get('city')).toEqual('city');
                expect(testWidget.get('zip')).toEqual('zip');
                expect(testWidget.get('ownership')).toEqual('type');
                expect(testWidget.get('reverse')).toEqual('No address found.');
            });
        });
        describe('visibility', function () {
            it('shows progress', function () {
                var updating = true;
                testWidget._updateVisibility(updating);

                expect(domClass.contains(testWidget.dlNode, 'hide'));
                expect(domClass.contains(testWidget.messageNode, 'show'));
            });
            it('hides progress', function () {
                var updating = true;
                testWidget._updateVisibility(!updating);

                expect(domClass.contains(testWidget.dlNode, 'show'));
                expect(domClass.contains(testWidget.messageNode, 'hide'));
            });
        });
        describe('getReverseGeocode', function() {
            xit('passes the point to the request', function(done) {
                var point = {
                    toJson: function() {
                        return {
                            a: 'a'
                        };
                    }
                };
                var request = jasmine.createSpy('request')
                    .and.returnValue({
                        then: function() {}
                    });
                stubmodule('app/ParcelIdentify', {
                    'dojo/request': request
                }).then(function(StubbedModule) {
                    var testWidget2 = new StubbedModule({
                        map: map
                    });

                    testWidget2.getElevation(point);

                    expect(request.calls.mostRecent().args[1].query.geometry)
                        .toEqual('{"a":"a"}');

                    done();
                });
            });
        });
    });
});