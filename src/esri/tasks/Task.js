//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/json","dojo/has","esri/kernel","esri/deferredUtils","esri/urlUtils","esri/Evented"],function(j,h,k,o,p,l,m,n){return j(n,{declaredClass:"esri.tasks._Task",_eventMap:{error:["error"],complete:["result"]},constructor:function(a){if(a&&h.isString(a))this._url=m.urlToObject(this.url=a);this.normalization=!0;this._errorHandler=h.hitch(this,this._errorHandler);this.registerConnectEvents()},_useSSL:function(){var a=this._url,d=/^http:/i;if(this.url)this.url=
this.url.replace(d,"https:");if(a&&a.path)a.path=a.path.replace(d,"https:")},_encode:function(a,d,e){var c,b,g={},f,i;for(f in a)if("declaredClass"!==f&&(c=a[f],b=typeof c,null!==c&&void 0!==c&&"function"!==b))if(h.isArray(c)){g[f]=[];i=c.length;for(b=0;b<i;b++)g[f][b]=this._encode(c[b])}else if("object"===b){if(c.toJson){b=c.toJson(e&&e[f]);if("esri.tasks.FeatureSet"===c.declaredClass&&b.spatialReference)b.sr=b.spatialReference,delete b.spatialReference;g[f]=d?b:k.toJson(b)}}else g[f]=c;return g},
_successHandler:function(a,d,e,c){d&&this[d].apply(this,a);e&&e.apply(null,a);c&&l._resDfd(c,a)},_errorHandler:function(a,d,e){this.onError(a);d&&d(a);e&&e.errback(a)},setNormalization:function(a){this.normalization=a},onError:function(){}})});