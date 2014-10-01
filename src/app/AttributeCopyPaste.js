define([
    'dojo/text!./templates/AttributeCopyPaste.html',

    'dojo/_base/array',
    'dojo/_base/declare',

    'dojo/aspect',
    'dojo/on',

    'dojo/dom-construct',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'app/clipboard',

    'dijit/form/Button'
], function(
    template,

    array,
    declare,

    aspect,
    on,

    domConstruct,

    _WidgetBase,
    _TemplatedMixin,

    _WidgetsInTemplateMixin,

    clipboard
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

        // Properties to be sent into constructor

        attributeEditor: null,

        // featureLayer: esri/layer/FeatureLayer
        // summary:
        //      the feature layer used in the attribute editor
        featureLayer: null,

        _setClipboardAttr: function(value) {
            clipboard.data = value;
        },

        _getClipboardAttr: function() {
            return clipboard.data;
        },

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.AttributeCopyPaste::postCreate', arguments);

            this.setupConnections();
            this.inherited(arguments);

            domConstruct.place(this.domNode, this.attributeEditor.editButtons);
        },
        setupConnections: function() {
            // summary:
            //      wire events, and such
            //
            console.log('app.AttributeCopyPaste::setupConnections', arguments);

            var self = this;

            // selects the first feature
            this.featureLayer.on('selection-complete', function(evt) {
                if (!evt || !evt.features || evt.features.length < 1) {
                    return;
                }

                self.data = evt.features[0].attributes;
            });

            // updates the feature as the user uses the next buttons
            this.attributeEditor.on('next', function(evt) {
                if (!evt || !evt.feature) {
                    return;
                }

                self.data = evt.feature.attributes;
            });

            aspect.after(this.attributeEditor, '_updateSelection', function() {
                array.forEach(this.layerInfos[0].fieldInfos, function(item) {
                    self.fieldInfoMap[item.fieldName] = item.dijit;
                }, self);
            }, true);
        },
        copy: function() {
            // summary:
            //      copies whatever is in this.data to app.clipboard
            //
            console.log('app.AttributeCopyPaste::copy', arguments);

            this.set('clipboard', this.data);
        },
        paste: function() {
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
        _setDijitValue: function(fieldName, value) {
            // summary:
            //      updates the field info dijit
            // fieldName - the data attribute field name
            // value - the string value to set as the new value
            console.log('app.AttributeCopyPaste::_setDijitValue', arguments);

            array.forEach(this.attributeEditor.layerInfos[0].fieldInfos, function(item) {
                if (item.fieldName === fieldName) {
                    item.dijit.set('value', value);
                }
            });
        }
    });
});