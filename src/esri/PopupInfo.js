//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/json","dojo/i18n","dojo/has","esri/kernel","esri/lang","dojo/i18n!dojo/cldr/nls/number"],function(t,i,j,q,w,x,y,g){return t(null,{declaredClass:"esri.PopupInfo",initialize:function(a,b){if(a){i.mixin(this,b);this.info=a;this.title=this.getTitle;this.content=this.getContent;var c=this._fieldLabels={},d=this._fieldsMap={};a.fieldInfos&&j.forEach(a.fieldInfos,function(a){c[a.fieldName]=a.label;d[a.fieldName]=a})}},toJson:function(){return q.fromJson(q.toJson(this.info))},
getTitle:function(){},getContent:function(){},getComponents:function(a){var b=this.info,c=a.getLayer(),d=i.clone(a.attributes)||{},e=i.clone(d),f=b.fieldInfos,v="",m="",n,k,h,r=c&&c._getDateOpts&&c._getDateOpts().properties,l={dateFormat:{properties:r,formatter:"DateFormat"+this._insertOffset(this._dateFormats.shortDateShortTime)}};f&&j.forEach(f,function(a){var b=a.fieldName;e[b]=this._formatValue(e[b],b,l);r&&a.format&&a.format.dateFormat&&(a=j.indexOf(r,b),-1<a&&r.splice(a,1))},this);if(c){var q=
c.types,u=c.typeIdField,t=u&&d[u];for(k in d)if(h=d[k],g.isDefined(h)){var o=this._getDomainName(c,q,t,k,h);g.isDefined(o)?e[k]=o:k===u&&(o=this._getTypeName(c,h),g.isDefined(o)&&(e[k]=o))}}b.title&&(v=i.trim(g.substitute(e,this._fixTokens(b.title),l)||""));b.description&&(m=i.trim(g.substitute(e,this._fixTokens(b.description),l)||""));f&&(n=[],j.forEach(f,function(a){(k=a.fieldName)&&a.visible&&n.push([a.label||k,g.substitute(e,"${"+k+"}",l)||""])}));var p,s;b.mediaInfos&&(p=[],j.forEach(b.mediaInfos,
function(a){s=0;h=a.value;switch(a.type){case "image":var b=h.sourceURL,b=b&&i.trim(g.substitute(d,this._fixTokens(b)));s=!!b;break;case "piechart":case "linechart":case "columnchart":case "barchart":s=j.some(h.fields,function(a){return g.isDefined(d[a])});break;default:return}if(s){a=i.clone(a);h=a.value;a.title=a.title?i.trim(g.substitute(e,this._fixTokens(a.title),l)||""):"";a.caption=a.caption?i.trim(g.substitute(e,this._fixTokens(a.caption),l)||""):"";if("image"===a.type){if(h.sourceURL=g.substitute(d,
this._fixTokens(h.sourceURL)),h.linkURL)h.linkURL=i.trim(g.substitute(d,this._fixTokens(h.linkURL))||"")}else{var c=d[h.normalizeField]||0;h.fields=j.map(h.fields,function(a){var b=d[a];(b=void 0===b?null:b)&&c&&(b/=c);return{y:b,tooltip:(this._fieldLabels[a]||a)+":<br/>"+this._formatValue(b,a,l,!!c)}},this)}p.push(a)}},this));return{title:v,description:m,fields:n&&n.length?n:null,mediaInfos:p&&p.length?p:null,formatted:e,editSummary:c&&c.getEditSummary?c.getEditSummary(a):""}},getAttachments:function(a){var b=
a.getLayer(),a=a.attributes;if(this.info.showAttachments&&b&&b.hasAttachments&&b.objectIdField&&(a=a&&a[b.objectIdField]))return b.queryAttachmentInfos(a)},_dateFormats:{shortDate:"(datePattern: 'M/d/y', selector: 'date')",longMonthDayYear:"(datePattern: 'MMMM d, y', selector: 'date')",dayShortMonthYear:"(datePattern: 'd MMM y', selector: 'date')",longDate:"(datePattern: 'EEEE, MMMM d, y', selector: 'date')",shortDateShortTime:"(datePattern: 'M/d/y', timePattern: 'h:mm a', selector: 'date and time')",
shortDateShortTime24:"(datePattern: 'M/d/y', timePattern: 'H:mm', selector: 'date and time')",shortDateLongTime:"(datePattern: 'M/d/y', timePattern: 'h:mm:ss a', selector: 'date and time')",shortDateLongTime24:"(datePattern: 'M/d/y', timePattern: 'H:mm:ss', selector: 'date and time')",longMonthYear:"(datePattern: 'MMMM y', selector: 'date')",shortMonthYear:"(datePattern: 'MMM y', selector: 'date')",year:"(datePattern: 'y', selector: 'date')"},_fixTokens:function(a){return a.replace(/(\{[^\{\r\n]+\})/g,
"$$$1")},_formatValue:function(a,b,c,d){var e=this._fieldsMap[b],b=e&&e.format;if(!g.isDefined(a)||!e||!g.isDefined(b))return a;var f="",j=[],e=b.hasOwnProperty("places")||b.hasOwnProperty("digitSeparator"),i=b.hasOwnProperty("digitSeparator")?b.digitSeparator:!0;if(e)f="NumberFormat",j.push("places: "+(g.isDefined(b.places)&&(!d||0<b.places)?Number(b.places):"Infinity")),j.length&&(f+="("+j.join(",")+")");else if(b.dateFormat)f="DateFormat"+this._insertOffset(this._dateFormats[b.dateFormat]||this._dateFormats.shortDateShortTime);
else return a;a=g.substitute({myKey:a},"${myKey:"+f+"}",c)||"";e&&!i&&(c=w.getLocalization("dojo.cldr","number"),c.group&&(a=a.replace(RegExp("\\"+c.group,"g"),"")));return a},_insertOffset:function(a){a&&(a=g.isDefined(this.utcOffset)?a.replace(/\)\s*$/,", utcOffset:"+this.utcOffset+")"):a);return a},_getDomainName:function(a,b,c,d,e){var f,i;b&&g.isDefined(c)&&j.some(b,function(b){if(b.id==c){if((f=b.domains&&b.domains[d])&&"inherited"===f.type)f=this._getLayerDomain(a,d),i=!0;return!0}return!1},
this);!i&&!f&&(f=this._getLayerDomain(a,d));if(f&&f.codedValues){var m;j.some(f.codedValues,function(a){return a.code==e?(m=a.name,!0):!1});return m}},_getLayerDomain:function(a,b){var c=a.fields;if(c){var d;j.some(c,function(a){return a.name===b?(d=a.domain,!0):!1});return d}},_getTypeName:function(a,b){var c=a.types;if(c){var d;j.some(c,function(a){return a.id==b?(d=a.name,!0):!1});return d}}})});