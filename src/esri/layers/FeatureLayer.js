//>>built
define(["dojo/_base/declare","dojo/_base/connect","dojo/_base/lang","dojo/_base/array","dojo/_base/json","dojo/_base/Deferred","dojo/date/locale","dojo/sniff","dojo/io-query","dojo/dom-construct","dojo/i18n","esri/kernel","esri/lang","esri/request","esri/deferredUtils","esri/SpatialReference","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/symbols/jsonUtils","esri/renderers/SimpleRenderer","esri/renderers/UniqueValueRenderer","esri/renderers/jsonUtils","esri/tasks/QueryTask","esri/tasks/query","esri/tasks/FeatureSet","esri/geometry/Extent","esri/geometry/jsonUtils","esri/geometry/normalizeUtils","esri/layers/GraphicsLayer","esri/layers/Field","esri/layers/TimeInfo","esri/layers/FeatureType","esri/layers/FeatureTemplate","esri/layers/FeatureEditResult","esri/layers/SnapshotMode","esri/layers/OnDemandMode","esri/layers/SelectionMode","esri/layers/TrackManager","dojo/i18n!esri/nls/jsapi","require"],
function(x,A,n,l,B,C,L,G,M,N,O,D,o,y,q,E,P,Q,R,S,H,T,U,V,I,F,J,W,X,Y,Z,$,aa,ba,z,K,ca,da,ea){x=x(Y,{declaredClass:"esri.layers.FeatureLayer",invalidParams:"query contains one or more unsupported parameters",_eventMap:{"add-attachment-complete":["result"],"before-apply-edits":["adds","updates","deletes"],"delete-attachments-complete":["results"],"edits-complete":["adds","updates","deletes"],"query-attachment-infos-complete":["results"],"query-count-complete":["count"],"query-features-complete":["featureSet"],
"query-ids-complete":["objectIds"],"query-related-features-complete":["featureSets"],"selection-complete":["features","method"],"update-end":["error","info"]},constructor:function(a,c){this.i18n=O.getLocalization("esri","jsapi");this._outFields=c&&c.outFields;this._loadCallback=c&&c.loadCallback;var b=c&&c._usePatch;this._usePatch=null===b||void 0===b?!0:b;this._trackIdField=c&&c.trackIdField;this.objectIdField=c&&c.objectIdField;this._maxOffset=c&&c.maxAllowableOffset;this._optEditable=c&&c.editable;
this._optAutoGen=c&&c.autoGeneralize;this.editSummaryCallback=c&&c.editSummaryCallback;this.userId=c&&c.userId;this.userIsAdmin=c&&c.userIsAdmin;this.useMapTime=c&&c.hasOwnProperty("useMapTime")?!!c.useMapTime:!0;this.source=c&&c.source;this.gdbVersion=c&&c.gdbVersion;this._selectedFeatures={};this._selectedFeaturesArr=[];this._newFeatures=[];this._deletedFeatures={};this._ulid=this._getUniqueId();b=this.constructor;switch(this.mode=o.isDefined(c&&c.mode)?c.mode:b.MODE_ONDEMAND){case b.MODE_SNAPSHOT:this._mode=
new K(this);this._isSnapshot=!0;break;case b.MODE_ONDEMAND:this._tileWidth=c&&c.tileWidth||512;this._tileHeight=c&&c.tileHeight||512;this._mode=new ca(this);this.latticeTiling=c&&c.latticeTiling;break;case b.MODE_SELECTION:this._mode=new da(this),this._isSelOnly=!0}this._initLayer=n.hitch(this,this._initLayer);this._selectHandler=n.hitch(this,this._selectHandler);this._editable=!1;if(n.isObject(a)&&a.layerDefinition)return this._collection=!0,this.mode=b.MODE_SNAPSHOT,this._initLayer(a),this;this._task=
new V(this.url,{source:this.source,gdbVersion:this.gdbVersion});b=this._url.path;this._fserver=!1;if(-1!==b.search(/\/FeatureServer\//i))this._fserver=!0;var d=c&&c.resourceInfo;if(d)this._initLayer(d);else{if(this.source)d={source:this.source.toJson()},this._url.query=n.mixin(this._url.query,{layer:B.toJson(d)});if(this.gdbVersion)this._url.query=n.mixin(this._url.query,{gdbVersion:this.gdbVersion});y({url:b,content:n.mixin({f:"json"},this._url.query),callbackParamName:"callback",load:this._initLayer,
error:this._errorHandler})}this.registerConnectEvents()},_initLayer:function(a,c){if(a||c){this._json=a;this._findCredential();if(this.credential&&this.credential.ssl||a&&a._ssl)this._useSSL(),this._task._useSSL();if(this._collection)this._mode=new K(this),this._isSnapshot=!0,this._featureSet=a.featureSet,this._nextId=a.nextObjectId,a=a.layerDefinition;if(a.hasOwnProperty("capabilities")){var b=this.capabilities=a.capabilities;this._editable=b&&-1!==b.toLowerCase().indexOf("editing")?!0:!1}else if(!this._collection)this._editable=
this._fserver;if(o.isDefined(this._optEditable))this._editable=this._optEditable,delete this._optEditable;this._json=B.toJson(this._json);if(this.isEditable())delete this._maxOffset;else if(this.mode!==this.constructor.MODE_SNAPSHOT&&("esriGeometryPolyline"===a.geometryType||"esriGeometryPolygon"===a.geometryType))this._autoGeneralize=o.isDefined(this._optAutoGen)?this._optAutoGen:this.mode===this.constructor.MODE_ONDEMAND,delete this._optAutoGen;var b=a.effectiveMinScale||a.minScale,d=a.effectiveMaxScale||
a.maxScale;!this._hasMin&&b&&this.setMinScale(b);!this._hasMax&&d&&this.setMaxScale(d);this.layerId=a.id;this.name=a.name;this.description=a.description;this.copyright=a.copyrightText;this.type=a.type;this.geometryType=a.geometryType;this.displayField=a.displayField;this.defaultDefinitionExpression=a.definitionExpression;this.fullExtent=new J(a.extent);this.initialExtent=new J(this.fullExtent.toJson());if(this.fullExtent.spatialReference)this.spatialReference=new E(this.fullExtent.spatialReference.toJson());
this.defaultVisibility=a.defaultVisibility;if("esriGeometryPoint"===this.geometryType||"esriGeometryMultipoint"===this.geometryType)this.latticeTiling=!1;this.indexedFields=a.indexedFields;this.maxRecordCount=a.maxRecordCount;this.canModifyLayer=a.canModifyLayer;this.supportsStatistics=a.supportsStatistics;this.supportsAdvancedQueries=a.supportsAdvancedQueries;this.hasLabels=a.hasLabels;this.canScaleSymbols=a.canScaleSymbols;this.supportsRollbackOnFailure=a.supportsRollbackOnFailure;this.syncCanReturnChanges=
a.syncCanReturnChanges;this.isDataVersioned=a.isDataVersioned;this.editFieldsInfo=a.editFieldsInfo;this.ownershipBasedAccessControlForFeatures=a.ownershipBasedAccessControlForFeatures;if(this.editFieldsInfo&&this.ownershipBasedAccessControlForFeatures)this.creatorField=this.editFieldsInfo.creatorField;this.relationships=a.relationships;this.allowGeometryUpdates=o.isDefined(a.allowGeometryUpdates)?a.allowGeometryUpdates:!0;this._isTable="Table"===this.type;for(var e=this.fields=[],d=a.fields,b=0;b<
d.length;b++)e.push(new Z(d[b]));if(!this.objectIdField){this.objectIdField=a.objectIdField;if(!this.objectIdField){d=a.fields;for(b=0;b<d.length;b++)if(e=d[b],"esriFieldTypeOID"===e.type){this.objectIdField=e.name;break}}this.objectIdField||console.debug("esri.layers.FeatureLayer: "+o.substitute({url:this.url},"objectIdField is not set [url: ${url}]"))}if(!o.isDefined(this._nextId)){d=this.objectIdField;e=-1;if(this._collection&&d)for(var f=(b=this._featureSet)&&b.features,h=f?f.length:0,g,b=0;b<
h;b++)g=(g=f[b].attributes)&&g[d],g>e&&(e=g);this._nextId=e+1}this.globalIdField=a.globalIdField;if(b=this.typeIdField=a.typeIdField)if(b=!this._getField(b)&&this._getField(b,!0))this.typeIdField=b.name;this.visibilityField=a.visibilityField;if(d=a.defaultSymbol)this.defaultSymbol=S.fromJson(d);var i=this.types=[],j=a.types,k,v,e=(b=this.editFieldsInfo)&&b.creatorField,f=b&&b.editorField;g=e||f;h=[];if(j)for(b=0;b<j.length;b++)k=new aa(j[b]),v=k.templates,g&&v&&v.length&&(h=h.concat(v)),i.push(k);
j=a.templates;k=this.templates=[];if(j)for(b=0;b<j.length;b++)i=new ba(j[b]),g&&h.push(i),k.push(i);for(b=0;b<h.length;b++)if(g=n.getObject("prototype.attributes",!1,h[b]))e&&delete g[e],f&&delete g[f];if(b=a.timeInfo){this.timeInfo=new $(b);this._startTimeField=b.startTimeField;this._endTimeField=b.endTimeField;if(this._startTimeField&&this._endTimeField)this._twoTimeFields=!0;this._trackIdField?b.trackIdField=this._trackIdField:this._trackIdField=b.trackIdField}this.hasAttachments=!this._collection&&
a.hasAttachments?!0:!1;this.htmlPopupType=a.htmlPopupType;var b=a.drawingInfo,m;if(!this.renderer)if(b&&b.renderer){if(m=b.renderer,this.setRenderer(U.fromJson(m)),"classBreaks"===m.type&&this.renderer.setMaxInclusive(!0),!this._collection){var p=m.type,d=[];m=this.renderer;switch(p){case "simple":d.push(m.symbol);break;case "uniqueValue":case "classBreaks":d.push(m.defaultSymbol),d=d.concat(l.map(m.infos,function(a){return a.symbol}))}var d=l.filter(d,o.isDefined),r=this._url.path+"/images/",s=this._getToken();
l.forEach(d,function(a){var b=a.url;if(b){if(-1===b.search(/https?\:/)&&-1===b.indexOf("data:"))a.url=r+b;s&&-1!==a.url.search(/https?\:/)&&(a.url+="?token="+s)}})}}else if(d)j=this.types,0<j.length?(m=new T(this.defaultSymbol,this.typeIdField),l.forEach(j,function(a){m.addValue(a.id,a.symbol)})):m=new H(this.defaultSymbol),this.setRenderer(m);else if(!this._isTable){switch(this.geometryType){case "esriGeometryPoint":case "esriGeometryMultipoint":p=new P;break;case "esriGeometryPolyline":p=new Q;
break;case "esriGeometryPolygon":p=new R}this.setRenderer(p?new H(p):null)}p=b&&b.transparency||0;if(!o.isDefined(this.opacity)&&0<p)this.opacity=1-p/100;this.version=a.currentVersion;if(!this.version)this.version="capabilities"in a||"drawingInfo"in a||"hasAttachments"in a||"htmlPopupType"in a||"relationships"in a||"timeInfo"in a||"typeIdField"in a||"types"in a?10:9.3;if((G("ie")||G("safari"))&&this.isEditable()&&10.02>this.version)this._ts=!0;this.loaded=!0;this._fixRendererFields();this._checkFields();
this._updateCaps();p=function(){this.onLoad(this);var a=this._loadCallback;a&&(delete this._loadCallback,a(this))};this._collection?(this._fireUpdateStart(),b=this._featureSet,delete this._featureSet,this._mode._drawFeatures(new F(b)),this._fcAdded=!0,p.call(this)):this._forceIdentity(p)}},setRenderer:function(a){this.inherited("setRenderer",arguments);var c=this.renderer;if(c){this._ager=-1!==c.declaredClass.indexOf("TemporalRenderer")&&c.observationAger&&c.observationRenderer;var c=l.filter([c,
c.observationRenderer,c.latestObservationRenderer,c.trackRenderer],o.isDefined),b=[];l.forEach(c,function(a){n.isFunction(a.attributeField)||b.push(a.attributeField);b.push(a.attributeField2);b.push(a.attributeField3)},this);this._rendererFields=l.filter(b,o.isDefined)}else this._ager=!1,this._rendererFields=[];this.loaded&&0<this._rendererFields.length&&(this._fixRendererFields(),this._checkFields(this._rendererFields));if(this.loaded&&this._collection)this._typesDirty=!0},_setMap:function(a){var c=
this.inherited(arguments),b=this._mode;b&&b.initialize(a);return c},_unsetMap:function(a){var c=this._mode;c&&c.suspend();if(this._trackManager)this._trackManager.destroy(),this._trackManager=null;A.disconnect(this._zoomConnect);this._zoomConnect=null;this._toggleTime(!1);this.inherited("_unsetMap",arguments)},refresh:function(){var a=this._mode;a&&a.refresh()},getOutFields:function(){return l.filter(this._getOutFields(),function(a){return"*"===a||!!this._getField(a)},this)},setEditable:function(a){if(!this._collection)return console.log("FeatureLayer:setEditable - this functionality is not yet supported for layer in a feature service"),
this;if(!this.loaded)return this._optEditable=a,this;var c=this._editable;this._editable=a;this._updateCaps();if(c!==a)this.onCapabilitiesChange();return this},getEditCapabilities:function(a){var c={canCreate:!1,canUpdate:!1,canDelete:!1};if(!this.loaded||!this.isEditable())return c;var b=a&&a.feature,a=a&&a.userId,d=l.map(this.capabilities?this.capabilities.toLowerCase().split(","):[],n.trim),e=-1<l.indexOf(d,"editing"),f=e&&-1<l.indexOf(d,"create"),c=e&&-1<l.indexOf(d,"update"),d=e&&-1<l.indexOf(d,
"delete"),h=this.ownershipBasedAccessControlForFeatures,g=this.editFieldsInfo,i=g&&g.creatorField,g=g&&g.realm,b=(b=b&&b.attributes)&&i?b[i]:void 0,j=!!this.userIsAdmin,i=!h||j||!(!h.allowOthersToUpdate&&!h.allowUpdateToOthers),h=!h||j||!(!h.allowOthersToDelete&&!h.allowDeleteToOthers);if(j||e&&!f&&!c&&!d)f=c=d=!0;e={canCreate:f,canUpdate:c,canDelete:d};if(null===b)e.canUpdate=c&&i,e.canDelete=d&&h;else if(""!==b&&b&&((a=a||this.getUserId())&&g&&(a=a+"@"+g),a.toLowerCase()!==b.toLowerCase()))e.canUpdate=
c&&i,e.canDelete=d&&h;return e},getUserId:function(){var a;this.loaded&&(a=this.credential&&this.credential.userId||this.userId||"");return a},setUserIsAdmin:function(a){this.userIsAdmin=a},setEditSummaryCallback:function(a){this.editSummaryCallback=a},getEditSummary:function(a,c,b){var b=o.isDefined(b)?b:(new Date).getTime(),d="",b=this.getEditInfo(a,c,b);(c=c&&c.callback||this.editSummaryCallback)&&(b=c(a,b)||"");if(n.isString(b))d=b;else{if(b){var a=b.action,c=b.userId,e=b.timeValue,f=0;a&&f++;
c&&f++;o.isDefined(e)&&f++;1<f&&(d=("edit"===a?"edit":"create")+(c?"User":"")+(o.isDefined(e)?b.displayPattern:""))}d=d&&o.substitute(b,this.i18n.layers.FeatureLayer[d])}return d},getEditInfo:function(a,c,b){if(this.loaded){var b=o.isDefined(b)?b:(new Date).getTime(),c=c&&c.action||"last",d=this.editFieldsInfo,e=d&&d.creatorField,f=d&&d.creationDateField,h=d&&d.editorField,d=d&&d.editDateField,h=(a=a&&a.attributes)&&h?a[h]:void 0,d=a&&d?a[d]:null,e=this._getEditData(a&&e?a[e]:void 0,a&&f?a[f]:null,
b),b=this._getEditData(h,d,b),g;switch(c){case "creation":g=e;break;case "edit":g=b;break;case "last":g=b||e}if(g)g.action=g===b?"edit":"creation";return g}},_getEditData:function(a,c,b){var d,e,f;o.isDefined(c)&&(e=b-c,f=0>e?"Full":6E4>e?"Seconds":12E4>e?"Minute":36E5>e?"Minutes":72E5>e?"Hour":864E5>e?"Hours":6048E5>e?"WeekDay":"Full");if(void 0!==a||f)if(d=d||{},d.userId=a,f)a=L.format,b=new Date(c),d.minutes=Math.floor(e/6E4),d.hours=Math.floor(e/36E5),d.weekDay=a(b,{datePattern:"EEEE",selector:"date"}),
d.formattedDate=a(b,{selector:"date"}),d.formattedTime=a(b,{selector:"time"}),d.displayPattern=f,d.timeValue=c;return d},isEditable:function(){return!(!this._editable&&!this.userIsAdmin)},setMaxAllowableOffset:function(a){if(!this.isEditable())this._maxOffset=a;return this},getMaxAllowableOffset:function(){return this._maxOffset},setAutoGeneralize:function(a){if(this.loaded){if(!this.isEditable()&&this.mode!==this.constructor.MODE_SNAPSHOT&&("esriGeometryPolyline"===this.geometryType||"esriGeometryPolygon"===
this.geometryType))if(this._autoGeneralize=a){if((a=this._map)&&a.loaded)this._maxOffset=Math.floor(a.extent.getWidth()/a.width)}else delete this._maxOffset}else this._optAutoGen=a;return this},setGDBVersion:function(a){if(!this._collection&&a!==this.gdbVersion&&(a||this.gdbVersion))this.gdbVersion=a,this._task.gdbVersion=a,this._url.query=n.mixin(this._url.query,{gdbVersion:a}),this.loaded&&(this.clearSelection(),this._map&&this.refresh()),this.onGDBVersionChange();return this},setDefinitionExpression:function(a){this._defnExpr=
a;(a=this._mode)&&a.propertyChangeHandler(1);return this},getDefinitionExpression:function(){return this._defnExpr},setTimeDefinition:function(a){this._isSnapshot?(this._timeDefn=a,(a=this._mode)&&a.propertyChangeHandler(2)):console.log("FeatureLayer.setTimeDefinition: layer in on-demand or selection mode does not support time definitions. Layer id = "+this.id+", Layer URL = "+this.url);return this},getTimeDefinition:function(){return this._timeDefn},setTimeOffset:function(a,c){this._timeOffset=a;
this._timeOffsetUnits=c;var b=this._mode;b&&b.propertyChangeHandler(0);return this},setUseMapTime:function(a){this.useMapTime=a;this._toggleTime(!this.suspended);(a=this._mode)&&a.propertyChangeHandler(0)},selectFeatures:function(a,c,b,d){var c=c||this.constructor.SELECTION_NEW,a=this._getShallowClone(a),e=this._map,f=q._fixDfd(new C(q._dfdCanceller));a.outFields=this.getOutFields();a.returnGeometry=!0;if(e)a.outSpatialReference=new E(e.spatialReference.toJson());if(!this._applyQueryFilters(a))return a=
{features:[]},this._selectHandler(a,c,b,d,f),f;if(e=this._canDoClientSideQuery(a))a={features:this._doQuery(a,e)},this._selectHandler(a,c,b,d,f);else{if(this._collection)return this._resolve([Error("FeatureLayer::selectFeatures - "+this.invalidParams)],null,d,f,!0),f;var h=this;if(this._ts)a._ts=(new Date).getTime();(f._pendingDfd=this._task.execute(a)).addCallbacks(function(a){h._selectHandler(a,c,b,d,f)},function(a){h._resolve([a],null,d,f,!0)})}return f},getSelectedFeatures:function(){var a=this._selectedFeatures,
c=[],b;for(b in a)a.hasOwnProperty(b)&&c.push(a[b]);return c},clearSelection:function(a){var c=this._selectedFeatures,b=this._mode,d;for(d in c)c.hasOwnProperty(d)&&(this._unSelectFeatureIIf(d,b),b._removeFeatureIIf(d));this._selectedFeatures={};this._isSelOnly&&b._applyTimeFilter(!0);if(!a)this.onSelectionClear();return this},setSelectionSymbol:function(a){if(this._selectionSymbol=a){var c=this._selectedFeatures,b;for(b in c)c.hasOwnProperty(b)&&c[b].setSymbol(a)}return this},getSelectionSymbol:function(){return this._selectionSymbol},
__msigns:[{n:"applyEdits",c:5,a:[{i:0},{i:1}],e:4,f:1}],applyEdits:function(a,c,b,d,e,f){var h=f.assembly,g=f.dfd;this._applyNormalized(a,h&&h[0]);this._applyNormalized(c,h&&h[1]);this.onBeforeApplyEdits(a,c,b);var i={},j=this.objectIdField,h={f:"json"},k=!1;if(this._collection)f={},f.addResults=a?l.map(a,function(){k=!0;return{objectId:this._nextId++,success:!0}},this):null,f.updateResults=c?l.map(c,function(a){k=!0;var b=a.attributes[j];i[b]=a;return{objectId:b,success:!0}},this):null,f.deleteResults=
b?l.map(b,function(a){k=!0;return{objectId:a.attributes[j],success:!0}},this):null,k&&this._editHandler(f,a,i,d,e,g);else{if(a&&0<a.length)h.adds=this._convertFeaturesToJson(a,0,1),k=!0;if(c&&0<c.length){for(f=0;f<c.length;f++){var v=c[f];i[v.attributes[j]]=v}h.updates=this._convertFeaturesToJson(c,0,0,1);k=!0}if(b&&0<b.length){c=[];for(f=0;f<b.length;f++)c.push(b[f].attributes[j]);h.deletes=c.join(",");k=!0}if(k){var m=this;return y({url:this._url.path+"/applyEdits",content:n.mixin(h,this._url.query),
callbackParamName:"callback",load:function(b){m._editHandler(b,a,i,d,e,g)},error:function(a){m._resolve([a],null,e,g,!0)}},{usePost:!0})}}},queryFeatures:function(a,c,b){return this._query("execute","onQueryFeaturesComplete",a,c,b)},queryRelatedFeatures:function(a,c,b){return this._query("executeRelationshipQuery","onQueryRelatedFeaturesComplete",a,c,b)},queryIds:function(a,c,b){return this._query("executeForIds","onQueryIdsComplete",a,c,b)},queryCount:function(a,c,b){return this._query("executeForCount",
"onQueryCountComplete",a,c,b)},queryAttachmentInfos:function(a,c,b){var d=this._url.path+"/"+a+"/attachments",e=new C(q._dfdCanceller),f=this;e._pendingDfd=y({url:d,content:n.mixin({f:"json"},this._url.query),callbackParamName:"callback",load:function(b){var b=b.attachmentInfos,g;l.forEach(b,function(b){g=M.objectToQuery({gdbVersion:f._url.query&&f._url.query.gdbVersion,layer:f._url.query&&f._url.query.layer,token:f._getToken()});b.url=d+"/"+b.id+(g?"?"+g:"");b.objectId=a});f._resolve([b],"onQueryAttachmentInfosComplete",
c,e)},error:function(a){f._resolve([a],null,b,e,!0)}});return e},addAttachment:function(a,c,b,d){return this._sendAttachment("add",a,c,b,d)},updateAttachment:function(a,c,b,d,e){b.appendChild(N.create("input",{type:"hidden",name:"attachmentId",value:c}));return this._sendAttachment("update",a,b,d,e)},deleteAttachments:function(a,c,b,d){var e=this._url.path+"/"+a+"/deleteAttachments",f=new C(q._dfdCanceller),h=this,c={f:"json",attachmentIds:c.join(",")};f._pendingDfd=y({url:e,content:n.mixin(c,this._url.query),
callbackParamName:"callback",load:n.hitch(this,function(c){c=c.deleteAttachmentResults;c=l.map(c,function(b){b=new z(b);b.attachmentId=b.objectId;b.objectId=a;return b});h._resolve([c],"onDeleteAttachmentsComplete",b,f)}),error:function(a){h._resolve([a],null,d,f,!0)}},{usePost:!0});return f},addType:function(a){var c=this.types;if(c){if(l.some(c,function(b){return b.id==a.id?!0:!1}))return!1;c.push(a)}else this.types=[a];return this._typesDirty=!0},deleteType:function(a){if(this._collection){var c=
this.types;if(c){var b=-1;l.some(c,function(c,e){return c.id==a?(b=e,!0):!1});if(-1<b)return this._typesDirty=!0,c.splice(b,1)[0]}}},toJson:function(){var a=this._json;if(a=n.isString(a)?B.fromJson(a):n.clone(a)){var a=a.layerDefinition?a:{layerDefinition:a},c=a.layerDefinition,b=this._collection;if(b&&this._typesDirty){c.types=l.map(this.types||[],function(a){return a.toJson()});var d=this.renderer,e=c.drawingInfo;if(e&&d&&-1===d.declaredClass.indexOf("TemporalRenderer"))e.renderer=d.toJson()}d=
null;if(!b||this._fcAdded)d={geometryType:c.geometryType,features:this._convertFeaturesToJson(this.graphics,!0)};a.featureSet=n.mixin({},a.featureSet||{},d);if(b)a.nextObjectId=this._nextId,c.capabilities=this.capabilities;return a}},onSelectionComplete:function(){},onSelectionClear:function(){},onBeforeApplyEdits:function(){},onEditsComplete:function(){},onQueryFeaturesComplete:function(){},onQueryRelatedFeaturesComplete:function(){},onQueryIdsComplete:function(){},onQueryCountComplete:function(){},
onQueryAttachmentInfosComplete:function(){},onAddAttachmentComplete:function(){},onUpdateAttachmentComplete:function(){},onDeleteAttachmentsComplete:function(){},onCapabilitiesChange:function(){},onGDBVersionChange:function(){},onQueryLimitExceeded:function(){},_forceIdentity:function(a){var c=this,b=this._url&&this._url.path;(this.ownershipBasedAccessControlForFeatures||this.userIsAdmin)&&!this._getToken()&&b&&D.id&&D.id._hasPortalSession()&&D.id._doPortalSignIn(b)?D.id.getCredential(b).then(function(){c._findCredential();
a.call(c)},function(){a.call(c)}):a.call(this)},_updateCaps:function(){var a=this._editable,c=n.trim(this.capabilities||""),b=l.map(c?c.split(","):[],n.trim),d=l.map(c?c.toLowerCase().split(","):[],n.trim),c=l.indexOf(d,"editing"),e,d={Create:l.indexOf(d,"create"),Update:l.indexOf(d,"update"),Delete:l.indexOf(d,"delete")};if(a&&-1===c)b.push("Editing");else if(!a&&-1<c){a=[c];for(e in d)-1<d[e]&&a.push(d[e]);a.sort();for(e=a.length-1;0<=e;e--)b.splice(a[e],1)}this.capabilities=b.join(",")},_counter:{value:0},
_getUniqueId:function(){return this._counter.value++},onSuspend:function(){this.inherited(arguments);this._toggleTime(!1);var a=this._mode;a&&a.suspend()},onResume:function(a){this.inherited(arguments);this._toggleTime(!0);this._updateMaxOffset();var c=this._mode,b=this._map,d=this.renderer;if(a.firstOccurrence){this.clearSelection();if(this.timeInfo&&(this._trackIdField||d&&(d.latestObservationRenderer||d.trackRenderer)))this._trackManager=new ea(this),this._trackManager.initialize(b);this._zoomConnect=
A.connect(b,"onZoomEnd",this,this._updateMaxOffset)}c&&(a.firstOccurrence?c.startup():c.resume())},_updateMaxOffset:function(){var a=this._map;if(a&&a.loaded&&this._autoGeneralize)this._maxOffset=Math.floor(a.extent.getWidth()/a.width)},_toggleTime:function(a){var c=this._map;if(a&&this.timeInfo&&this.useMapTime&&c){if(this._mapTimeExtent=c.timeExtent,!this._timeConnect)this._timeConnect=A.connect(c,"onTimeExtentChange",this,this._timeChangeHandler)}else this._mapTimeExtent=null,A.disconnect(this._timeConnect),
this._timeConnect=null},_timeChangeHandler:function(a){this._mapTimeExtent=a;(a=this._mode)&&a.propertyChangeHandler(0)},_getOffsettedTE:function(a){var c=this._timeOffset,b=this._timeOffsetUnits;return a&&c&&b?a.offset(-1*c,b):a},_getTimeOverlap:function(a,c){return a&&c?a.intersection(c):a||c},_getTimeFilter:function(a){var c=this.getTimeDefinition(),b;if(c&&(b=this._getTimeOverlap(c,null),!b))return[!1];if(a){if(a=b?this._getTimeOverlap(a,b):a,!a)return[!1]}else a=b;return[!0,a]},_getAttributeFilter:function(a){var c=
this.getDefinitionExpression();return a?c?"("+c+") AND ("+a+")":a:c},_applyQueryFilters:function(a){a.where=this._getAttributeFilter(a.where);a.maxAllowableOffset=this._maxOffset;if(this.timeInfo){var c=this._getTimeFilter(a.timeExtent);if(c[0])a.timeExtent=c[1];else return!1}return!0},_add:function(a){var c=this._selectionSymbol,b=a.attributes,d=this.visibilityField;c&&this._isSelOnly&&a.setSymbol(c);if(d&&b&&b.hasOwnProperty(d))a[b[d]?"show":"hide"]();return this.add.apply(this,arguments)},_remove:function(){return this.remove.apply(this,
arguments)},_canDoClientSideQuery:function(a){var c=[],b=this._map;if(!this._isTable&&b&&!(a.text||a.where&&a.where!==this.getDefinitionExpression())){var d=this._isSnapshot,e=this._isSelOnly,f=a.geometry;if(f)if(!e&&a.spatialRelationship===I.SPATIAL_REL_INTERSECTS&&"extent"===f.type&&(d||b.extent.contains(f)))c.push(1);else return;if(b=a.objectIds)if(d)c.push(2);else{var f=b.length,h=this._mode,g=0,i;for(i=0;i<f;i++)h._getFeature(b[i])&&g++;if(g===f)c.push(2);else return}if(this.timeInfo)if(a=a.timeExtent,
b=this._mapTimeExtent,d)a&&c.push(3);else if(e){if(a)return}else if(b)if(-1!==l.indexOf(c,2))a&&c.push(3);else return;else if(0<c.length)a&&c.push(3);else if(a)return;return 0<c.length?c:null}},_doQuery:function(a,c,b){var d=[],e=this._mode,f=this.objectIdField,h,g;if(-1!==l.indexOf(c,2)){var d=[],i=a.objectIds;g=i.length;for(h=0;h<g;h++){var j=e._getFeature(i[h]);j&&d.push(j)}if(0===d.length)return[]}if(-1!==l.indexOf(c,1)){e=0<d.length?d:this.graphics;g=e.length;i=a.geometry._normalize(null,!0);
d=[];for(h=0;h<g;h++){var j=e[h],k=j.geometry;k&&(this.normalization&&i.length?(i[0].intersects(k)||i[1].intersects(k))&&d.push(j):i.intersects(k)&&d.push(j))}if(0===d.length)return[]}if(-1!==l.indexOf(c,3)&&this.timeInfo)e=0<d.length?d:this.graphics,a=a.timeExtent,d=this._filterByTime(e,a.startTime,a.endTime).match;return b?l.map(d,function(a){return a.attributes[f]},this):d},_filterByTime:function(a,c,b){var d=this._startTimeField,e=this._endTimeField,f;this._twoTimeFields||(f=d||e);var h=o.isDefined,
g=[],i=[],j,k=a.length,l,m,c=c?c.getTime():-Infinity,b=b?b.getTime():Infinity;if(f)for(j=0;j<k;j++)l=a[j],m=l.attributes,d=m[f],d>=c&&d<=b?g.push(l):i.push(l);else for(j=0;j<k;j++)l=a[j],m=l.attributes,f=m[d],m=m[e],f=h(f)?f:-Infinity,m=h(m)?m:Infinity,f>=c&&f<=b||m>=c&&m<=b||c>=f&&b<=m?g.push(l):i.push(l);return{match:g,noMatch:i}},_resolve:function(a,c,b,d,e){c&&this[c].apply(this,a);b&&b.apply(null,a);d&&q._resDfd(d,a,e)},_getShallowClone:function(a){var c=new I,b;for(b in a)a.hasOwnProperty(b)&&
(c[b]=a[b]);return c},_query:function(a,c,b,d,e){var f=this,h=this._map,g=new C(q._dfdCanceller),i=b,j=function(b,e){if(!e&&"execute"===a&&!f._isTable){var h=b.features,i=f._mode,j=f.objectIdField,k;for(k=h.length-1;0<=k;k--){var l=i._getFeature(h[k].attributes[j]);l&&h.splice(k,1,l)}}f._resolve([b],c,d,g)};if("executeRelationshipQuery"!==a){i=this._getShallowClone(b);i.outFields=this.getOutFields();i.returnGeometry=b.hasOwnProperty("returnGeometry")?b.returnGeometry:!0;var k;if(h)i.outSpatialReference=
new E(h.spatialReference.toJson());if(!this._applyQueryFilters(i)){switch(a){case "execute":k=new F({features:[]});break;case "executeForIds":k=[];break;case "executeForCount":k=0}j(k,!0);return g}if(b=this._canDoClientSideQuery(i)){i=this._doQuery(i,b,"executeForIds"===a||"executeForCount"===a);switch(a){case "execute":k=new F;k.features=i;break;case "executeForIds":k=i;break;case "executeForCount":k=i.length}j(k,!0);return g}}if(this._collection)return this._resolve([Error("FeatureLayer::_query - "+
this.invalidParams)],null,e,g,!0),g;if(this._ts)i._ts=(new Date).getTime();(g._pendingDfd=this._task[a](i)).addCallbacks(j,function(a){f._resolve([a],null,e,g,!0)});return g},_convertFeaturesToJson:function(a,c,b,d){var e=[],f=this._selectionSymbol,h=this.visibilityField,g,i=this.objectIdField;if(this.loaded&&(b||d))g=l.filter(this.fields,function(a){return!1===a.editable&&(!d||a.name!==i)});for(b=0;b<a.length;b++){var j=a[b],k={},o=j.geometry,m=j.attributes,p=j.symbol;if(o&&(!d||!this.loaded||this.allowGeometryUpdates))k.geometry=
o.toJson();if(h)k.attributes=m=n.mixin({},m),m[h]=j.visible?1:0;else if(m)k.attributes=n.mixin({},m);k.attributes&&g&&g.length&&l.forEach(g,function(a){delete k.attributes[a.name]});if(p&&p!==f)k.symbol=p.toJson();e.push(k)}return c?e:B.toJson(e)},_selectHandler:function(a,c,b,d,e){var f,d=this.constructor;switch(c){case d.SELECTION_NEW:this.clearSelection(!0);f=!0;break;case d.SELECTION_ADD:f=!0;break;case d.SELECTION_SUBTRACT:f=!1}var d=a.features,h=this._mode,g=[],i=this.objectIdField,j,k;if(f)for(f=
0;f<d.length;f++)j=d[f],k=j.attributes[i],j=h._addFeatureIIf(k,j),g.push(j),this._selectFeatureIIf(k,j,h);else for(f=0;f<d.length;f++)j=d[f],k=j.attributes[i],this._unSelectFeatureIIf(k,h),k=h._removeFeatureIIf(k),g.push(k||j);this._isSelOnly&&h._applyTimeFilter(!0);this._resolve([g,c,a.exceededTransferLimit?{queryLimitExceeded:!0}:null],"onSelectionComplete",b,e);if(a.exceededTransferLimit)this.onQueryLimitExceeded()},_selectFeatureIIf:function(a,c,b){var d=this._selectedFeatures,e=d[a];e||(b._incRefCount(a),
d[a]=c,this._isTable||this._setSelectSymbol(c));return e||c},_unSelectFeatureIIf:function(a,c){var b=this._selectedFeatures[a];b&&(c._decRefCount(a),delete this._selectedFeatures[a],this._isTable||this._setUnSelectSymbol(b));return b},_isSelected:function(){},_setSelectSymbol:function(a){var c=this._selectionSymbol;c&&!this._isSelOnly&&a.setSymbol(c)},_setUnSelectSymbol:function(a){var c=this._selectionSymbol;c&&!this._isSelOnly&&c===a.symbol&&a.setSymbol(null,!0)},_getOutFields:function(){var a=
l.filter([this.objectIdField,this.typeIdField,this.creatorField,this._startTimeField,this._endTimeField,this._trackIdField].concat(this._rendererFields),function(a,c,e){return!!a&&l.indexOf(e,a)===c}),c=n.clone(this._outFields);if(c){if(-1!==l.indexOf(c,"*"))return c;l.forEach(a,function(a){-1===l.indexOf(c,a)&&c.push(a)});return c}return a},_checkFields:function(a){var c=a||this._getOutFields();l.forEach(c,function(a){"*"!==a&&(this._getField(a)||console.debug("esri.layers.FeatureLayer: "+o.substitute({url:this.url,
field:a},"unable to find '${field}' field in the layer 'fields' information [url: ${url}]")))},this);!a&&!this._isTable&&!this._fserver&&!this._collection&&(l.some(this.fields,function(a){return a&&"esriFieldTypeGeometry"===a.type?!0:!1})||console.debug("esri.layers.FeatureLayer: "+o.substitute({url:this.url},"unable to find a field of type 'esriFieldTypeGeometry' in the layer 'fields' information. If you are using a map service layer, features will not have geometry [url: ${url}]")))},_fixRendererFields:function(){var a=
this.renderer;if(a&&0<this.fields.length){var a=l.filter([a,a.observationRenderer,a.latestObservationRenderer,a.trackRenderer],o.isDefined),c=[];l.forEach(a,function(a){var d;if((d=a.attributeField)&&!n.isFunction(d))if(d=!this._getField(d)&&this._getField(d,!0))a.attributeField=d.name;if(d=a.attributeField2)if(d=!this._getField(d)&&this._getField(d,!0))a.attributeField2=d.name;if(d=a.attributeField3)if(d=!this._getField(d)&&this._getField(d,!0))a.attributeField3=d.name;n.isFunction(a.attributeField)||
c.push(a.attributeField);c.push(a.attributeField2);c.push(a.attributeField3)},this);this._rendererFields=l.filter(c,o.isDefined)}},_getField:function(a,c){var b=this.fields;if(!b||0===b.length)return null;var d;c&&(a=a.toLowerCase());l.some(b,function(b){var f=!1;(f=c?b&&b.name.toLowerCase()===a?!0:!1:b&&b.name===a?!0:!1)&&(d=b);return f});return d},_getDateOpts:function(){if(!this._dtOpts)this._dtOpts={properties:l.map(l.filter(this.fields,function(a){return!!(a&&"esriFieldTypeDate"===a.type)}),
function(a){return a.name})};return this._dtOpts},_applyNormalized:function(a,c){a&&c&&l.forEach(a,function(a,d){a&&c[d]&&a.setGeometry(c[d])})},_editHandler:function(a,c,b,d,e,f){var e=a.addResults,h=a.updateResults,a=a.deleteResults,g,i,j,k,n=this.objectIdField,m=this._mode,o=this._isTable;g=this.editFieldsInfo;var r=this.getOutFields()||[],s=g&&g.creatorField,q=g&&g.creationDateField,t=g&&g.editorField,u=g&&g.editDateField;g=g&&g.realm;-1===l.indexOf(r,"*")&&(s&&-1===l.indexOf(r,s)&&(s=null),q&&
-1===l.indexOf(r,q)&&(q=null),t&&-1===l.indexOf(r,t)&&(t=null),u&&-1===l.indexOf(r,u)&&(u=null));var r=q||u?(new Date).getTime():null,w=s||t?this.getUserId():void 0;w&&g&&(w=w+"@"+g);if(e)for(g=0;g<e.length;g++)if(e[g]=new z(e[g]),!o&&(i=e[g],i.success))i=i.objectId,j=c[g],(k=j._graphicsLayer)&&k!==this&&k.remove(j),k=j.attributes||{},k[n]=i,s&&(k[s]=w),t&&(k[t]=w),q&&(k[q]=r),u&&(k[u]=r),j.setAttributes(k),m._init&&m.drawFeature(j);if(h)for(g=0;g<h.length;g++)if(h[g]=new z(h[g]),!o&&(i=h[g],i.success)){i=
i.objectId;j=b[i];if(c=m._getFeature(i))c.geometry!==j.geometry&&c.setGeometry(W.fromJson(j.geometry.toJson())),this._repaint(c,i);j=c||j;k=j.attributes||{};t&&(k[t]=w);u&&(k[u]=r);j.setAttributes(k)}if(a){b=[];for(g=0;g<a.length;g++)if(a[g]=new z(a[g]),!o&&(i=a[g],i.success&&(i=i.objectId,j=m._getFeature(i))))this._unSelectFeatureIIf(i,m)&&b.push(j),j._count=0,m._removeFeatureIIf(i);if(0<b.length)this.onSelectionComplete(b,this.constructor.SELECTION_SUBTRACT)}this._resolve([e,h,a],"onEditsComplete",
d,f)},_sendAttachment:function(a,c,b,d,e){var f=this;return y({url:this._url.path+"/"+c+"/"+("add"===a?"addAttachment":"updateAttachment"),form:b,content:n.mixin(this._url.query,{f:"json",token:this._getToken()||void 0}),callbackParamName:"callback.html",handleAs:"json"}).addCallback(function(b){var e="add"===a?"onAddAttachmentComplete":"onUpdateAttachmentComplete",b=new z(b["add"===a?"addAttachmentResult":"updateAttachmentResult"]);b.attachmentId=b.objectId;b.objectId=c;f._resolve([b],e,d);return b}).addErrback(function(a){f._resolve([a],
null,e,null,!0)})},_repaint:function(a,c,b){c=o.isDefined(c)?c:a.attributes[this.objectIdField];(!(c in this._selectedFeatures)||!this._selectionSymbol)&&a.setSymbol(a.symbol,b)},_getKind:function(a){var c=this._trackManager;return c?c.isLatestObservation(a)?1:0:0}});n.mixin(x,{MODE_SNAPSHOT:0,MODE_ONDEMAND:1,MODE_SELECTION:2,SELECTION_NEW:3,SELECTION_ADD:4,SELECTION_SUBTRACT:5,POPUP_NONE:"esriServerHTMLPopupTypeNone",POPUP_HTML_TEXT:"esriServerHTMLPopupTypeAsHTMLText",POPUP_URL:"esriServerHTMLPopupTypeAsURL"});
X._createWrappers(x);return x});