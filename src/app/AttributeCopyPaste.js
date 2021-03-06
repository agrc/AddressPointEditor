define([
    'app/clipboard',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom-construct',
    'dojo/text!./templates/AttributeCopyPaste.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dijit/form/Button'
], function (
    clipboard,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    domConstruct,
    template,
    array,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Copy and paste form data

        templateString: template,
        baseClass: 'attribute-copy-paste atiNavButtons',
        widgetsInTemplate: true,

        // dijit reference to copy button
        copyButton: null,

        // dijit reference to paste button
        pasteButton: null,

        // the attribute name mapped to it's dijit
        fieldInfoMap: {},

        // ignoreFields: []
        // summary:
        //      fields to ignore with copy paste
        ignoreFields: ['OBJECTID', 'Editor', 'LoadDate', 'ModifyDate', 'AddNum', 'AddNumSuffix'],

        // Properties to be sent into constructor

        attributeEditor: null,

        // featureLayer: esri/layer/FeatureLayer
        // summary:
        //      the feature layer used in the attribute editor
        featureLayer: null,

        _setClipboardAttr: function (value) {
            var clone = lang.clone(value);

            for (var prop in clone) {
                if (clone.hasOwnProperty(prop)) {
                    if (this.ignoreFields.indexOf(prop) > -1) {
                        delete clone[prop];
                    }
                }
            }
            clipboard.data = clone;
            // this is _clipboard because of the app\clipboard amd module
            this._set('_clipboard', clone);
        },

        _getClipboardAttr: function () {
            return clipboard.data;
        },

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.AttributeCopyPaste::postCreate', arguments);

            this.setupConnections();
            this.inherited(arguments);

            domConstruct.place(this.domNode, this.attributeEditor.editButtons);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            //
            console.log('app.AttributeCopyPaste::setupConnections', arguments);

            var self = this;

            // selects the first feature
            this.featureLayer.on('selection-complete', function (evt) {
                if (!evt || !evt.features || evt.features.length < 1) {
                    return;
                }

                self.data = evt.features[0].attributes;
            });

            // updates the feature as the user uses the next buttons
            this.attributeEditor.on('next', function (evt) {
                if (!evt || !evt.feature) {
                    return;
                }

                self.data = evt.feature.attributes;
            });

            aspect.after(this.attributeEditor, '_updateSelection', function () {
                array.forEach(this.layerInfos[0].fieldInfos, function (item) {
                    if (self.ignoreFields.indexOf(item.fieldName) < 0) {
                        self.fieldInfoMap[item.fieldName] = item.dijit;
                    }
                }, self);
            }, true);

            // this is _clipboard because of the app\clipboard amd module
            this.watch('_clipboard', lang.hitch(this, function (field, old, value) {
                if (!value) {
                    return;
                }

                this.pasteButton.set('disabled', false);
            }));
        },
        copy: function () {
            // summary:
            //      copies whatever is in this.data to app.clipboard
            //
            console.log('app.AttributeCopyPaste::copy', arguments);

            this.set('clipboard', this.data);
        },
        paste: function () {
            // summary:
            //      pastes the form data from the `attributeEditor`
            console.log('app.AttributeCopyPaste::paste', arguments);

            var data = this.get('clipboard');

            if (!data) {
                return;
            }

            for (var fieldName in this.fieldInfoMap) {
                if (this.fieldInfoMap.hasOwnProperty(fieldName)) {
                    var value = data[fieldName];
                    this._setDijitValue(fieldName, value);
                }
            }
        },
        _setDijitValue: function (fieldName, value) {
            // summary:
            //      updates the field info dijit
            // fieldName - the data attribute field name
            // value - the string value to set as the new value
            console.log('app.AttributeCopyPaste::_setDijitValue', arguments);

            array.forEach(this.attributeEditor.layerInfos[0].fieldInfos, function (item) {
                if (item.fieldName === fieldName) {
                    item.dijit.set('value', value);
                }
            });
        }
    });
});
