//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/_base/connect","dojo/_base/kernel","dojo/has","dojo/window","dojo/Stateful","dojo/query","dojo/dom","dojo/dom-attr","dojo/dom-class","dojo/dom-construct","dojo/dom-geometry","dojo/dom-style","dijit/registry","esri/kernel","esri/lang","esri/sniff","esri/domUtils","esri/geometry/Polyline","esri/geometry/Polygon","esri/InfoWindowBase","esri/PopupBase","dojo/i18n!esri/nls/jsapi","dojo/NodeList-dom","require","require"],function(A,v,n,f,g,B,C,D,L,y,q,e,z,x,l,E,M,r,N,F,G,H,I,
J,K){return A([I,J,D],{declaredClass:"esri.dijit.Popup",offsetX:3,offsetY:3,zoomFactor:4,marginLeft:25,marginTop:25,highlight:!0,pagingControls:!0,pagingInfo:!0,keepHighlightOnHide:!1,popupWindow:!0,titleInBody:!0,anchor:"auto",constructor:function(a,c){this.initialize();v.mixin(this,a);this.domNode=y.byId(c);var b=this._nls=v.mixin({},K.widgets.popup),d=this.domNode;e.add(d,"esriPopup");(this._isRTL=!x.isBodyLtr())&&l.set(d,"direction","rtl");q.set(d,"innerHTML","<div class='esriPopupWrapper' style='position: absolute;'><div class='sizer'><div class='titlePane'><div class='spinner hidden' title='"+
b.NLS_searching+"...'></div><div class='title'></div><div class='titleButton prev hidden' title='"+b.NLS_prevFeature+"'></div><div class='titleButton next hidden' title='"+b.NLS_nextFeature+"'></div><div class='titleButton maximize' title='"+b.NLS_maximize+"'></div><div class='titleButton close' title='"+b.NLS_close+"'></div></div></div><div class='sizer content'><div class='contentPane'></div></div><div class='sizer'><div class='actionsPane'><div class='actionList hidden'><a class='action zoomTo' href='javascript:void(0);'>"+
b.NLS_zoomTo+"</a></div></div></div><div class='pointer hidden'></div></div><div class='outerPointer hidden'></div>");this._sizers=g.query(".sizer",d);b=g.query(".titlePane",d)[0];y.setSelectable(b,!1);this._title=g.query(".title",b)[0];this._prevFeatureButton=g.query(".prev",b)[0];this._nextFeatureButton=g.query(".next",b)[0];this._maxButton=g.query(".maximize",b)[0];this._spinner=g.query(".spinner",b)[0];this._contentPane=g.query(".contentPane",d)[0];this._positioner=g.query(".esriPopupWrapper",
d)[0];this._pointer=g.query(".pointer",d)[0];this._outerPointer=g.query(".outerPointer",d)[0];this._actionList=g.query(".actionsPane .actionList",d)[0];this._eventConnections=[f.connect(g.query(".close",b)[0],"onclick",this,this.hide),f.connect(this._prevFeatureButton,"onclick",this,this.selectPrevious),f.connect(this._nextFeatureButton,"onclick",this,this.selectNext),f.connect(this._maxButton,"onclick",this,this._toggleSize),f.connect(g.query(".zoomTo",this._actionList)[0],"onclick",this,this._zoomToFeature),
f.connect(this,"onClearFeatures",this,this._featuresCleared),f.connect(this,"onSelectionChange",this,this._featureSelected),f.connect(this,"onDfdComplete",this,this._updateUI)];B("esri-touch")&&(d=F.setScrollable(this._contentPane),this._eventConnections.push(d[0],d[1]));this._toggleVisibility(!1)},onMaximize:function(){},onRestore:function(){},setMap:function(a){this.inherited(arguments);z.place(this.domNode,a.root);this.highlight&&this.enableHighlight(a);this._maxHeight=l.get(this._contentPane,
"maxHeight")},unsetMap:function(){this.disableHighlight(this.map);this.inherited(arguments)},setTitle:function(a){if(this.popupWindow){if(!r.isDefined(a)||""===a)a="&nbsp;";this.destroyDijits(this._title);this.place(a,this._title);this.isShowing&&(this.startupDijits(this._title),this.reposition())}},setContent:function(a){if(this.popupWindow){if(!r.isDefined(a)||""===a)a="&nbsp;";this.destroyDijits(this._contentPane);this.place(a,this._contentPane);this.isShowing&&(this.startupDijits(this._contentPane),
this.reposition())}},show:function(a,c){if(this.popupWindow)if(a){var b=this.map,d;a.spatialReference?(this._location=a,d=b.toScreen(a)):(this._location=b.toMap(a),d=a);var m=b._getFrameWidth();if(-1!==m&&(d.x%=m,0>d.x&&(d.x+=m),b.width>m))for(b=(b.width-m)/2;d.x<b;)d.x+=m;this._maximized?this.restore():this._setPosition(d);c&&c.closestFirst&&this.showClosestFirst(this._location);this.isShowing||(this._toggleVisibility(!0),this._followMap(),this.startupDijits(this._title),this.startupDijits(this._contentPane),
this.reposition(),this.showHighlight(),this.onShow())}else this._toggleVisibility(!0)},hide:function(){this.isShowing&&(this._toggleVisibility(!1),this._unfollowMap(),this.keepHighlightOnHide||this.hideHighlight(),this.onHide())},resize:function(a,c){if(this.popupWindow)this._sizers.style({width:a+"px"}),l.set(this._contentPane,"maxHeight",c+"px"),this._maxHeight=c,this.isShowing&&this.reposition()},reposition:function(){this.popupWindow&&this.map&&this._location&&!this._maximized&&this.isShowing&&
this._setPosition(this.map.toScreen(this._location))},maximize:function(){var a=this.map;if(a&&!this._maximized&&this.popupWindow){this._maximized=!0;var c=this._maxButton;e.remove(c,"maximize");e.add(c,"restore");q.set(c,"title",this._nls.NLS_restore);var c=this.marginLeft,b=this.marginTop,d=a.width-2*c,a=a.height-2*b;l.set(this.domNode,{left:this._isRTL?null:c+"px",right:this._isRTL?c+"px":null,top:b+"px",bottom:null});l.set(this._positioner,{left:null,right:null,top:null,bottom:null});this._savedWidth=
l.get(this._sizers[0],"width");this._savedHeight=l.get(this._contentPane,"maxHeight");this._sizers.style({width:d+"px"});l.set(this._contentPane,{maxHeight:a-65+"px",height:a-65+"px"});this._showPointer("");this._unfollowMap();e.add(this.domNode,"esriPopupMaximized");this.onMaximize()}},restore:function(){if(this.map&&this._maximized&&this.popupWindow){this._maximized=!1;var a=this._maxButton;e.remove(a,"restore");e.add(a,"maximize");q.set(a,"title",this._nls.NLS_maximize);l.set(this._contentPane,
"height",null);this.resize(this._savedWidth,this._savedHeight);this._savedWidth=this._savedHeight=null;this.show(this._location);this._followMap();e.remove(this.domNode,"esriPopupMaximized");this.onRestore()}},startup:function(){},destroy:function(){this.map&&this.unsetMap();this.cleanup();this.isShowing&&this.hide();this.destroyDijits(this._title);this.destroyDijits(this._content);n.forEach(this._eventConnections,f.disconnect);z.destroy(this.domNode);this._sizers=this._contentPane=this._actionList=
this._positioner=this._pointer=this._outerPointer=this._title=this._prevFeatureButton=this._nextFeatureButton=this._spinner=this._eventConnections=this._pagerScope=this._targetLocation=this._nls=this._maxButton=null},selectNext:function(){this.select(this.selectedIndex+1)},selectPrevious:function(){this.select(this.selectedIndex-1)},setFeatures:function(){this.inherited(arguments);this._updateUI()},postscript:null,_highlightSetter:function(a){var c=this.highlight,b=this.map;this.highlight=a;if(b&&
a!==c)if(a){if(this.enableHighlight(b),a=this.features&&this.features[this.selectedIndex])this.updateHighlight(b,a),this.showHighlight()}else this.disableHighlight(b)},_pagingControlsSetter:function(a){var c=this.pagingControls,b=this.map;this.pagingControls=a;b&&a!==c&&this._updatePagingControls()},_pagingInfoSetter:function(a){var c=this.pagingInfo,b=this.map;this.pagingInfo=a;b&&a!==c&&this.features&&this.features.length&&this._updatePagingInfo()},_popupWindowSetter:function(a){var c=this.popupWindow,
b=this.map;this.popupWindow=a;b&&a!==c&&(a?(this._updateUI(),this._updateWindow()):(this.hide(),this.showHighlight()))},_anchorSetter:function(a){var c=this.anchor;this.anchor=a;this.map&&a!==c&&this.reposition()},_featuresCleared:function(){this.setTitle("&nbsp;");this.setContent("&nbsp;");this._setPagerCallbacks(this);this._updateUI();this.hideHighlight()},_featureSelected:function(){this._updateUI();this._updateWindow()},_updateWindow:function(){var a=this.selectedIndex;if(0<=a){var c=this.features[a].getContent(),
b;!this.titleInBody&&c&&v.isString(c.id)&&(b=E.byId(c.id))&&b.set&&/_PopupRenderer/.test(b.declaredClass)&&b.set("showTitle",!1);this.setContent(c);this.updateHighlight(this.map,this.features[a]);this.showHighlight()}},_toggleVisibility:function(a){this._setVisibility(a);this.isShowing=a},_setVisibility:function(a){l.set(this.domNode,"visibility",a?"visible":"hidden")},_followMap:function(){this._unfollowMap();var a=this.map;this._handles=[f.connect(a,"onPanStart",this,this._onPanStart),f.connect(a,
"onPan",this,this._onPan),f.connect(a,"onZoomStart",this,this._onZoomStart),f.connect(a,"onExtentChange",this,this._onExtentChange)]},_unfollowMap:function(){var a=this._handles;if(a)n.forEach(a,f.disconnect),this._handles=null},_onPanStart:function(){var a=this.domNode.style;this._panOrigin={left:a.left,top:a.top,right:a.right,bottom:a.bottom}},_onPan:function(a,c){var b=this._panOrigin,d=c.x,m=c.y,e=b.left,h=b.top,o=b.right,b=b.bottom;e&&(e=parseFloat(e)+d+"px");h&&(h=parseFloat(h)+m+"px");o&&(o=
parseFloat(o)-d+"px");b&&(b=parseFloat(b)-m+"px");l.set(this.domNode,{left:e,top:h,right:o,bottom:b})},_onZoomStart:function(){this._setVisibility(!1)},_onExtentChange:function(a,c,b){b&&(this._setVisibility(!0),this.show(this._targetLocation||this._location));this._targetLocation=null},_toggleSize:function(){this._maximized?this.restore():this.maximize()},_setPosition:function(a){var c=a.x,b=a.y,a=this.offsetX||0,d=this.offsetY||0,e=0,f=0,h=x.position(this.map.container,!0),o=h.w,g=h.h,j="Left",
k="bottom",p=x.getContentBox(this._positioner),n=p.w/2,v=p.h/2,s=l.get(this._sizers[0],"height")+this._maxHeight+l.get(this._sizers[2],"height"),w=s/2,q=0,r=0,t=c,u=b,i=this.anchor.toLowerCase();if("auto"===i){if(i=C.getBox)i=i(),q=Math.max(i.l,h.x),o=Math.min(i.l+i.w,h.x+h.w),r=Math.max(i.t,h.y),g=Math.min(i.t+i.h,h.y+h.h),t+=h.x,u+=h.y;h=u-r>=s;s=g-u>=s;i=o-t>=p.w;p=t-q>=p.w;u-r>w&&g-u>=w&&(i?(k="",j="Left"):p&&(k="",j="Right"));j&&k&&t-q>n&&o-t>=n&&(h?(j="",k="bottom"):s&&(j="",k="top"));j&&k&&
(i&&h?(j="Left",k="bottom"):i&&s?(j="Left",k="top"):p&&s?(j="Right",k="top"):p&&h&&(j="Right",k="bottom"))}else k=j="",-1!==i.indexOf("top")?k="bottom":-1!==i.indexOf("bottom")&&(k="top"),-1!==i.indexOf("left")?j="Right":-1!==i.indexOf("right")&&(j="Left");w=k+j;switch(w){case "top":case "bottom":f=14;break;case "Left":case "Right":e=13;break;case "topLeft":case "topRight":case "bottomLeft":case "bottomRight":f=45}l.set(this.domNode,{left:c+"px",top:b+"px",right:null,bottom:null});c={left:null,right:null,
top:null,bottom:null};j?c[j.toLowerCase()]=e+a+"px":c.left=-n+"px";k?c[k]=f+d+"px":c.top=-v+"px";l.set(this._positioner,c);this._showPointer(w)},_showPointer:function(a){e.remove(this._pointer,"top,bottom,right,left,topLeft,topRight,bottomRight,bottomLeft,hidden".split(","));e.remove(this._outerPointer,["right","left","hidden"]);"Right"===a||"Left"===a?(a=a.toLowerCase(),e.add(this._outerPointer,a)):e.add(this._pointer,a)},_setPagerCallbacks:function(a,c,b){if(this.pagingControls&&!(a===this&&(!this._pagerScope||
this._pagerScope===this))&&a!==this._pagerScope){this._pagerScope=a;if(a===this)c=this.selectPrevious,b=this.selectNext;var d=this._eventConnections;f.disconnect(d[1]);f.disconnect(d[2]);c&&(d[1]=f.connect(this._prevFeatureButton,"onclick",a,c));b&&(d[2]=f.connect(this._nextFeatureButton,"onclick",a,b))}},_getLocation:function(a){var c=this.map,b,d,e=0,f;if(a=a&&a.geometry)switch(a.type){case "point":b=a;break;case "multipoint":b=a.getPoint(0);d=a.getExtent();break;case "polyline":b=a.getPoint(0,
0);d=a.getExtent();if(-1!==c._getFrameWidth())n.forEach(a.paths,function(a){var a=(new G({paths:[a,c.spatialReference]})).getExtent(),b=Math.abs(a.ymax-a.ymin),d=Math.abs(a.xmax-a.xmin),b=d>b?d:b;b>e&&(e=b,f=a)}),f.spatialReference=d.spatialReference,d=f;break;case "polygon":if(b=a.getPoint(0,0),d=a.getExtent(),-1!==c._getFrameWidth())n.forEach(a.rings,function(a){var a=(new H({rings:[a,c.spatialReference]})).getExtent(),b=Math.abs(a.ymax-a.ymin),d=Math.abs(a.xmax-a.xmin),b=d>b?d:b;b>e&&(e=b,f=a)}),
f.spatialReference=d.spatialReference,d=f}return[b,d]},_zoomToFeature:function(){var a=this.features,c=this.selectedIndex,b=this.map;if(a){c=this._getLocation(a[c]);a=c[0];c=c[1];if(!a)a=this._location;if(!c||!c.intersects(this._location))this._location=a;if(c)b.setExtent(c,!0);else{var d=b.getNumLevels(),c=b.getLevel(),e=b.getMaxZoom(),f=this.zoomFactor||1;0<d?c!==e&&(d=c+f,d>e&&(d=e),b.navigationManager._wheelZoom({value:d-c,mapPoint:a},!0)):b.navigationManager._wheelZoom({value:2*(1/Math.pow(2,
f)),mapPoint:a},!0)}}},_updatePagingControls:function(){var a=this._prevFeatureButton,c=this._nextFeatureButton,b=this.selectedIndex,d=this.features?this.features.length:0;this.pagingControls&&1<d?(0===b?e.add(a,"hidden"):e.remove(a,"hidden"),b===d-1?e.add(c,"hidden"):e.remove(c,"hidden")):(e.add(a,"hidden"),e.add(c,"hidden"))},_updatePagingInfo:function(){var a=this.features?this.features.length:0,c=this._nls,b="&nbsp;";this.pagingInfo&&1<a&&c.NLS_pagingInfo&&(b=r.substitute({index:this.selectedIndex+
1,total:a},c.NLS_pagingInfo));if(a&&(c=this.getSelectedFeature(),a=c.getInfoTemplate(),c=c.getTitle(),(!a||/esri\.InfoTemplate/.test(a.declaredClass)||!this.titleInBody)&&c))b=c+("&nbsp;"===b?"":" "+b);this.setTitle(b)},_updateUI:function(){if(this.popupWindow){var a=this.features,c=this.deferreds,b=a?a.length:0,d=this._spinner,f=this._actionList,g=this._nls;this._updatePagingControls();this._updatePagingInfo();c&&c.length?a?e.remove(d,"hidden"):this.setContent("<div style='text-align: center;'>"+
g.NLS_searching+"...</div>"):(e.add(d,"hidden"),b||this.setContent("<div style='text-align: center;'>"+g.NLS_noInfo+".</div>"));b?e.remove(f,"hidden"):e.add(f,"hidden")}}})});