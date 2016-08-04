define([
    'dojo/_base/declare',

    'dojo/dom-construct',

    'dijit/form/FilteringSelect',
    'dijit/form/NumberSpinner',

    'esri/layers/InheritedDomain',

    'esri/dijit/AttributeInspector'
], function (
    declare,

    domConstruct,

    FilteringSelect,
    NumberSpinner,

    InheritedDomain,

    AttributeInspector
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([AttributeInspector], {
        _createDomainField: function (a, b, c, d) {
            console.log('app.patch.AttributeInspector::createDomainField ', arguments);
            b = a.domain;
            if (c && c.domains && c.domains[a.name] &&
                false === c.domains[a.name] instanceof InheritedDomain) {
                b = c.domains[a.name];
            }

            return !b ? null : b.codedValues ? new FilteringSelect({
                'class': 'atiField',
                name: a.alias || a.name,
                searchAttr: 'name',
                required: !a.nullable
            }, domConstruct.create('div', null, d)) : new NumberSpinner({
                'class': 'atiField'
            }, domConstruct.create('div', null, d));
        }
    });
});
