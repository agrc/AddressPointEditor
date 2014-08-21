define([
    'dojo/text!./templates/ParcelIdentify.html',

    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojo/on',
    'dojo/string',
    'dojo/topic',

    'dojo/dom-class',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'agrc/modules/WebAPI',
    'agrc/modules/String',

    'app/config'
], function(
    template,

    declare,
    lang,

    on,
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

        _setParcelIdAttr: function(value) {
            if(!value){
                value = 'No Data';
            }

            this._set('parcelId', value);
            this.parcelIdNode.innerHTML = value;
        },
        _setAddressAttr: function(value) {
            if(!value){
                value = 'No Data';
            }

            this._set('address', value);
            this.addressNode.innerHTML = value;
        },
        _setCityAttr: function(value) {
            if(!value){
                value = 'No Data';
            }

            this._set('city', value);
            this.cityNode.innerHTML = value;
        },
        _setZipAttr: function(value) {
            if(!value){
                value = 'No Data';
            }

            this._set('zip', value);
            this.zipNode.innerHTML = value;
        },
        _setOwnershipAttr: function(value) {
            if(!value){
                value = 'No Data';
            }

            this._set('ownership', value);
            this.ownershipNode.innerHTML = value;
        },
        _setMessageAttr: {
            node: 'messageNode',
            type: 'innerHTML'
        },

        // the agrc web api helper
        api: null,

        // Properties to be sent into constructor

        // reference to the map
        map: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.ParcelIdentify::postCreate', arguments);

            this.setupConnections();

            this.api = new WebApi({
                apiKey: config.apiKey
            });

            this.inherited(arguments);
        },
        identify: function(evt) {
            // summary:
            //      sends a request to the web api
            //
            // map click evt
            console.log('app.ParcelIdentify::identify', arguments);

            var apiPoint = string.substitute('point:[${x},${y}]', evt.mapPoint);
            this._reset(null);

            var getParcel = lang.hitch(this, lang.partial(this._getParcelInfo, apiPoint)),
                setValues = lang.hitch(this, this._setValues),
                networkError = lang.hitch(this, this._networkError);

            this._getCounty(apiPoint)
                .then(getParcel)
                .then(setValues, networkError);
        },
        _setValues: function(parcelResults) {
            // summary:
            //      gets the parcel search api result
            // parcelResults
            console.log('app.ParcelIdentify::_setValues', arguments);

            if (!parcelResults || parcelResults.length < 1) {
                this._reset('No parcel found');
                topic.publish('app/identify', this);

                return;
            }

            var parcel = parcelResults[0].attributes;

            if (!parcel) {
                this._reset('No parcel found');
                topic.publish('app/identify', this);

                return;
            }

            /*jshint -W106*/
            this.set('parcelId', parcel.parcel_id);
            this.set('address', parcel.parcel_add);
            this.set('city', parcel.parcel_city);
            this.set('zip', parcel.parcel_zip);
            this.set('ownership', parcel.own_type);
            /*jshint +W106*/

            topic.publish('app/identify', this);
        },
        _getParcelInfo: function(apiPoint, countyResult) {
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
        _getCounty: function(apiPoint) {
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
        _networkError: function(e) {
            // summary:
            //      handles xhr errors
            // e
            console.log('app.ParcelIdentify::_networkError', arguments);

            this._reset('Search Failure. Please try again.' + e || 'There was a problem searching.');
        },
        _reset: function(message) {
            // summary:
            //      reset identify and set message
            // message
            console.log('app.ParcelIdentify::_reset', arguments);

            this.set('parcelId', null);
            this.set('address', null);
            this.set('city', null);
            this.set('zip', null);
            this.set('ownership', null);
            this.set('message', message);
        },
        _updateVisibility: function(name, value) {
            // summary:
            //      hides and shows empty dt items
            // name, value
            console.log('app.ParcelIdentify::_updateVisibility', arguments);

            if (name === 'message' && value) {
                domClass.replace(this.dlNode, 'hide', 'show');
                domClass.replace(this.messageNode, 'show', 'hide');

                return;
            }

            domClass.replace(this.messageNode, 'hide', 'show');
            domClass.replace(this.dlNode, 'show', 'hide');
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            console.log('app.ParcelIdentify::setupConnections', arguments);

            var scoped = this;
            topic.subscribe('app/identify-click', function(e) {
                    scoped.identify(e);
                });

            this.watch('message', function(name, oldValue, value) {
                // get the current value from the textbox and set it in the node
                scoped._updateVisibility(name, value);
            });

            this.watch('parcelId', function(name, oldValue, value) {
                // get the current value from the textbox and set it in the node
                scoped._updateVisibility(name, value);
            });
        }
    });
});