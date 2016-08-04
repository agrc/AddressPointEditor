define([
    'dojo/text!./templates/ParcelIdentify.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/string',
    'dojo/topic',

    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'agrc/modules/WebAPI',
    'agrc/modules/String',

    'app/config'
], function (
    template,

    declare,
    lang,

    string,
    topic,

    domClass,

    _WidgetBase,
    _TemplatedMixin,

    WebApi,
    stringHelper,

    config
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Takes a map click and sends it to the search api. Then publishes the results to the toaster.

        templateString: template,
        baseClass: 'parcel-identify',

        _setParcelIdAttr: function (value) {
            if (!value) {
                value = 'No parcel data.';
            }

            this._set('parcelId', value);
            this.parcelIdNode.innerHTML = value;
        },
        _setAddressAttr: function (value) {
            if (!value) {
                value = 'No parcel data.';
            }

            this._set('address', value);
            this.addressNode.innerHTML = value;
        },
        _setCityAttr: function (value) {
            if (!value) {
                value = 'No parcel data.';
            }

            this._set('city', value);
            this.cityNode.innerHTML = value;
        },
        _setZipAttr: function (value) {
            if (!value) {
                value = 'No parcel data.';
            }

            this._set('zip', value);
            this.zipNode.innerHTML = value;
        },
        _setOwnershipAttr: function (value) {
            if (!value) {
                value = 'No parcel data.';
            }

            this._set('ownership', value);
            this.ownershipNode.innerHTML = value;
        },
        _setReverseAttr: function (value) {
            if (!value) {
                value = 'No address found.';
            }

            this._set('reverse', value);
            this.reverseNode.innerHTML = value;
        },
        _setXAttr: function (value) {
            if (!value) {
                value = 'No data.';
            } else {
                value = +(Math.round(value + 'e+2') + 'e-2');
            }

            this._set('x', value);
            this.xNode.innerHTML = value;
        },
        _setYAttr: function (value) {
            if (!value) {
                value = 'No data.';
            } else {
                value = +(Math.round(value + 'e+2') + 'e-2');
            }

            this._set('y', value);
            this.yNode.innerHTML = value;
        },

        // the agrc web api helper
        api: null,

        // Properties to be sent into constructor

        // reference to the map
        map: null,

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ParcelIdentify::postCreate', arguments);

            this._reset(null);
            this.setupConnections();

            this.api = new WebApi({
                apiKey: config.apiKey
            });

            this.inherited(arguments);
        },
        identify: function (evt) {
            // summary:
            //      sends a request to the web api
            //
            // map click evt
            console.log('app.ParcelIdentify::identify', arguments);

            this.mapPoint = evt.mapPoint;
            var apiPoint = string.substitute('point:[${x},${y}]', evt.mapPoint);

            this._reset(null);

            var getParcel = lang.hitch(this, lang.partial(this._getParcelInfo, apiPoint));
            var setValues = lang.hitch(this, this._setValues);
            var updateAddress = lang.hitch(this, this._updateAddress);
            var networkError = lang.hitch(this, this._networkError);

            this._reverseGeocode(evt.mapPoint)
                .then(updateAddress);

            this._getCounty(apiPoint)
                .then(getParcel)
                .then(setValues, networkError);
        },
        _setValues: function (parcelResults) {
            // summary:
            //      gets the parcel search api result
            // parcelResults
            console.log('app.ParcelIdentify::_setValues', arguments);
            var parcel = {};

            if (parcelResults && parcelResults.length > 0) {
                parcel = parcelResults[0].attributes;
            }

            /*jshint -W106*/
            this.set('parcelId', parcel.parcel_id || null);
            this.set('address', parcel.parcel_add || null);
            this.set('city', parcel.parcel_city || null);
            this.set('zip', parcel.parcel_zip || null);
            this.set('ownership', parcel.own_type || null);
            this.set('x', this.mapPoint.x || null);
            this.set('y', this.mapPoint.y || null);
            /*jshint +W106*/

            topic.publish('app/identify', this);
        },
        _getParcelInfo: function (apiPoint, countyResult) {
            // summary:
            //      gets the parcel information from the search api
            // apiPoint, county
            console.log('app.ParcelIdentify::_getParcelInfo', arguments);

            if (!countyResult || countyResult.length < 1) {
                this._reset('No county found');
                return;
            }

            var county = stringHelper.removeWhiteSpace(countyResult[0].attributes.name.toLowerCase());

            if (!county) {
                this._reset('No county found');
                return;
            }

            var fc = 'sgid10.cadastre.parcels_' + county;
            return this.api.search(fc, [
                'parcel_id',
                'parcel_add',
                'parcel_city',
                'parcel_zip',
                'own_type'
            ], {
                geometry: apiPoint,
                attributeStyle: 'lower',
                spatialReference: this.map.spatialReference.wkid
            });
        },
        _getCounty: function (apiPoint) {
            // summary:
            //      gets the county name from the search api
            // apiPoint - the string x,y formatted for the searcha pi
            console.log('app.ParcelIdentify::_getCounty', arguments);

            return this.api.search('sgid10.boundaries.counties', ['name'], {
                geometry: apiPoint,
                attributeStyle: 'lower',
                spatialReference: this.map.spatialReference.wkid
            });
        },
        _reverseGeocode: function (point) {
            // summary:
            //      description
            // point
            console.log('app.ParcelIdentify::_reverseGeocode', arguments);

            return this.api.reverseGeocode(point.x, point.y, {
                distance: 50,
                spatialReference: this.map.spatialReference.wkid
            });
        },
        _updateAddress: function (reverseResults) {
            // summary:
            //      sets the value
            // apiPoint
            console.log('app.ParcelIdentify::_updateAddress', arguments);

            if (!reverseResults || reverseResults.length < 1) {
                this.set('reverse', null);

                return;
            }

            var address = reverseResults.address;

            if (!address) {
                this.set('reverse', null);

                return;
            }

            this.set('reverse', address.street);
        },
        _networkError: function (e) {
            // summary:
            //      handles xhr errors
            // e
            console.log('app.ParcelIdentify::_networkError', arguments);

            this._reset('Search Failure. Please try again.' + e || 'There was a problem searching.');
        },
        _reset: function () {
            // summary:
            //      reset definition list
            console.log('app.ParcelIdentify::_reset', arguments);

            this.set('x', null);
            this.set('y', null);
            this.set('parcelId', null);
            this.set('address', null);
            this.set('city', null);
            this.set('zip', null);
            this.set('reverse', null);
            this.set('ownership', null);
        },
        _updateVisibility: function (updating) {
            // summary:
            //      hides and shows empty dt items
            // updating: boolean
            console.log('app.ParcelIdentify::_updateVisibility', arguments);

            if (updating) {
                domClass.replace(this.dlNode, 'hide', 'show');
                domClass.replace(this.messageNode, 'show', 'hide');

                return;
            }

            domClass.replace(this.messageNode, 'hide', 'show');
            domClass.replace(this.dlNode, 'show', 'hide');
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            console.log('app.ParcelIdentify::setupConnections', arguments);

            var scoped = this;
            topic.subscribe('app/identify-click', function (e) {
                scoped._updateVisibility(true);
                scoped.identify(e);
            });

            this.watch('x', function (name, oldValue, value) {
                // there is always a map click event. x shoudl always be set.
                if (+value > 0) {
                    scoped._updateVisibility(false);
                }
            });
        }
    });
});
