//>>built
define(["require","dojo/_base/kernel","dojo/_base/declare","dojo/_base/connect","dojo/_base/lang","dojo/_base/array","dojo/_base/event","dojo/on","dojo/aspect","dojo/dom","dojo/dom-class","dojo/dom-construct","dojo/dom-geometry","dojo/dom-style","dijit/registry","esri/kernel","esri/config","esri/sniff","esri/lang","esri/_coremap","esri/MapNavigationManager"],function(s,G,H,x,m,o,y,z,I,A,l,B,J,K,L,t,C,e,p,M,N){var u={up:"panUp",right:"panRight",down:"panDown",left:"panLeft"},D={upperRight:"panUpperRight",lowerRight:"panLowerRight",
lowerLeft:"panLowerLeft",upperLeft:"panUpperLeft"},f=x.connect,h=x.disconnect,j=B.create,n=K.set,v=m.hitch,q=J.getMarginBox,E=G.deprecated,w=m.mixin,F=0;return H(M,{declaredClass:"esri.Map",constructor:function(a,c){w(this,{_slider:null,_navDiv:null,_mapParams:w({attributionWidth:0.45,slider:!0,nav:!1,logo:!0,sliderStyle:"small",sliderPosition:"top-left",sliderOrientation:"vertical",autoResize:!0},c||{})});w(this,{isDoubleClickZoom:!1,isShiftDoubleClickZoom:!1,isClickRecenter:!1,isScrollWheelZoom:!1,
isPan:!1,isRubberBandZoom:!1,isKeyboardNavigation:!1,isPanArrows:!1,isZoomSlider:!1});if(m.isFunction(t._css))t._css=t._css(this._mapParams.force3DTransforms),this.force3DTransforms=this._mapParams.force3DTransforms;var b=e("esri-transforms")&&e("esri-transitions");this.navigationMode=this._mapParams.navigationMode||b&&"css-transforms"||"classic";if("css-transforms"===this.navigationMode&&!b)this.navigationMode="classic";this.fadeOnZoom=p.isDefined(this._mapParams.fadeOnZoom)?this._mapParams.fadeOnZoom:
"css-transforms"===this.navigationMode;if("css-transforms"!==this.navigationMode)this.fadeOnZoom=!1;this.setMapCursor("default");this.smartNavigation=c&&c.smartNavigation;if(!p.isDefined(this.smartNavigation)&&e("mac")&&!e("esri-touch")&&!e("esri-pointer")&&!(3.5>=e("ff"))){var d=navigator.userAgent.match(/Mac\s+OS\s+X\s+([\d]+)(\.|\_)([\d]+)\D/i);if(d&&p.isDefined(d[1])&&p.isDefined(d[3]))b=parseInt(d[1],10),d=parseInt(d[3],10),this.smartNavigation=10<b||10===b&&6<=d}this.showAttribution=p.isDefined(this._mapParams.showAttribution)?
this._mapParams.showAttribution:!0;this._onLoadHandler_connect=f(this,"onLoad",this,"_onLoadInitNavsHandler");var k=j("div",{"class":"esriControlsBR"+(this._mapParams.nav?" withPanArrows":"")},this.root);if(this.showAttribution)if(b=m.getObject("esri.dijit.Attribution",!1))this._initAttribution(b,k);else{var i=F++,g=this;this._rids&&this._rids.push(i);s(["esri/dijit/Attribution"],function(a){var b=g._rids?o.indexOf(g._rids,i):-1;-1!==b&&(g._rids.splice(b,1),g._initAttribution(a,k))})}if(this._mapParams.logo){b=
{};if(6===e("ie"))b.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled='true', sizingMethod='crop', src='"+s.toUrl("esri")+"/images/map/logo-med.png')";b=this._ogol=j("div",{style:b},k);25E4>this.root.clientWidth*this.root.clientHeight?l.add(b,"logo-sm"):l.add(b,"logo-med");if(!e("esri-touch")&&!e("esri-pointer"))this._ogol_connect=f(b,"onclick",this,"_openLogoLink")}this.navigationManager=new N(this);if(c&&c.basemap)this._onLoadFix=!0,this.setBasemap(c.basemap),this._onLoadFix=!1;
if(this.autoResize=this._mapParams.autoResize)b=(b=L.getEnclosingWidget(this.container))&&b.resize?b:window,d=v(this,this.resize),this._rszSignal=z.pausable(b,"resize",d),this._oriSignal=z.pausable(window,"orientationchange",d),I.after(b,"resize",d,!0)},_initAttribution:function(a,c){var b=j("span",{"class":"esriAttribution"},c,"first");n(b,"width",Math.floor(this.width*this._mapParams.attributionWidth)+"px");this._connects.push(f(b,"onclick",function(){l.contains(this,"esriAttributionOpen")?l.remove(this,
"esriAttributionOpen"):this.scrollWidth>this.clientWidth&&l.add(this,"esriAttributionOpen")}));this.attribution=new a({map:this},b)},_cleanUp:function(){this.disableMapNavigation();this.navigationManager.destroy();var a=this._slider;a&&a.destroy&&!a._destroyed&&a.destroy();var a=this._navDiv,c=this.attribution;a&&B.destroy(a);c&&c.destroy();this._connects.push(this._slider_connect,this._ogol_connect,this._rszSignal,this._oriSignal);o.forEach(this._connects,h);this.attribution=this.navigationManager=
this._rids=this._connects=this._slider_connect=this._ogol_connect=this._rszSignal=this._oriSignal=null;this.inherited("_cleanUp",arguments)},_isPanningOrZooming:function(){return this.__panning||this.__zooming},_canZoom:function(a){var c=this.getLevel();return!this.__tileInfo||!(c===this.getMinZoom()&&0>a||c===this.getMaxZoom()&&0<a)},_onLoadInitNavsHandler:function(){this.enableMapNavigation();this._createNav();if("small"===this._mapParams.sliderStyle||!this._createSlider)this._createSimpleSlider();
else if(this._mapParams.slider){var a=-1!==this._getSliderClass(!0).indexOf("Horizontal"),a=[a?"dijit.form.HorizontalSlider":"dijit.form.VerticalSlider",a?"dijit.form.HorizontalRule":"dijit.form.VerticalRule",a?"dijit.form.HorizontalRuleLabels":"dijit.form.VerticalRuleLabels"];if(o.some(a,function(a){return!m.getObject(a,!1)})){var a=o.map(a,function(a){return a.replace(/\./g,"/")}),c=F++,b=this;this._rids&&this._rids.push(c);s(a,function(){var a=b._rids?o.indexOf(b._rids,c):-1;-1!==a&&(b._rids.splice(a,
1),b._createSlider.apply(b,arguments))})}else a=o.map(a,function(a){return m.getObject(a,!1)}),this._createSlider.apply(this,a)}h(this._onLoadHandler_connect)},_createNav:function(){if(this._mapParams.nav){var a,c,b,d=l.add,k=this.id;this._navDiv=j("div",{id:k+"_navdiv"},this.root);d(this._navDiv,"navDiv");var i=this.width/2,g=this.height/2,e;for(b in u)c=u[b],a=j("div",{id:k+"_pan_"+b},this._navDiv),d(a,"fixedPan "+c),"up"===b||"down"===b?(e=parseInt(q(a).w,10)/2,n(a,{left:i-e+"px",zIndex:30})):
(e=parseInt(q(a).h,10)/2,n(a,{top:g-e+"px",zIndex:30})),this._connects.push(f(a,"onclick",v(this,this[c])));this._onMapResizeNavHandler_connect=f(this,"onResize",this,"_onMapResizeNavHandler");for(b in D)c=D[b],a=j("div",{id:k+"_pan_"+b,style:{zIndex:30}},this._navDiv),d(a,"fixedPan "+c),this._connects.push(f(a,"onclick",v(this,this[c])));this.isPanArrows=!0}},_onMapResizeNavHandler:function(a,c,b){var a=this.id,c=c/2,b=b/2,d=A.byId,e,f,g;for(e in u)f=d(a+"_pan_"+e),"up"===e||"down"===e?(g=parseInt(q(f).w,
10)/2,n(f,"left",c-g+"px")):(g=parseInt(q(f).h,10)/2,n(f,"top",b-g+"px"))},_createSimpleSlider:function(){if(this._mapParams.slider){var a=this._slider=j("div",{id:this.id+"_zoom_slider","class":this._getSliderClass(),style:{zIndex:30}}),c=e("esri-touch")&&!e("ff")?"touchstart":e("esri-pointer")?navigator.msPointerEnabled?"MSPointerDown":"pointerdown":"onclick",b=j("div",{"class":"esriSimpleSliderIncrementButton"},a),d=j("div",{"class":"esriSimpleSliderDecrementButton"},a);b.innerHTML="+";d.innerHTML=
"&ndash;";8>e("ie")&&l.add(d,"dj_ie67Fix");this._connects.push(f(b,c,this,this._simpleSliderChangeHandler));this._connects.push(f(d,c,this,this._simpleSliderChangeHandler));"touchstart"==c&&(this._connects.push(f(b,"onclick",this,this._simpleSliderChangeHandler)),this._connects.push(f(d,"onclick",this,this._simpleSliderChangeHandler)));10>e("ie")&&A.setSelectable(a,!1);this.root.appendChild(a);this.isZoomSlider=!0}},_simpleSliderChangeHandler:function(a){y.stop(a);this._extentUtil({numLevels:-1!==
a.currentTarget.className.indexOf("IncrementButton")?1:-1})},_getSliderClass:function(a){var a=a?"Large":"Simple",c=this._mapParams.sliderOrientation,b=this._mapParams.sliderPosition||"",c=c&&"horizontal"===c.toLowerCase()?"esri"+a+"SliderHorizontal":"esri"+a+"SliderVertical";if(b)switch(b.toLowerCase()){case "top-left":b="esri"+a+"SliderTL";break;case "top-right":b="esri"+a+"SliderTR";break;case "bottom-left":b="esri"+a+"SliderBL";break;case "bottom-right":b="esri"+a+"SliderBR"}return"esri"+a+"Slider "+
c+" "+b},_createSlider:function(a,c,b){if(this._mapParams.slider){var d=j("div",{id:this.id+"_zoom_slider"},this.root),k=C.defaults.map,i=this._getSliderClass(!0),g=-1!==i.indexOf("Horizontal");-1!==i.indexOf("SliderTL")||i.indexOf("SliderBL");-1!==i.indexOf("SliderTL")||i.indexOf("SliderTR");var h=this.getNumLevels();if(0<h){var l,m,r=this._mapParams.sliderLabels,p=!!r;if(k=!1!==r){var q=g?"bottomDecoration":"rightDecoration";if(!r){r=[];for(g=0;g<h;g++)r[g]=""}o.forEach([{"class":"esriLargeSliderTicks",
container:q,count:h,dijitClass:c},{"class":p&&"esriLargeSliderLabels",container:q,count:h,labels:r,dijitClass:b}],function(a){var b=j("div"),e=a.dijitClass;delete a.dijitClass;d.appendChild(b);e===c?l=new e(a,b):m=new e(a,b)})}a=this._slider=new a({id:d.id,"class":i,minimum:this.getMinZoom(),maximum:this.getMaxZoom(),discreteValues:h,value:this.getLevel(),clickSelect:!0,intermediateChanges:!0,style:"z-index:30;"},d);a.startup();k&&(l.startup(),m.startup());this._slider_connect=f(a,"onChange",this,
"_onSliderChangeHandler");this._connects.push(f(this,"onExtentChange",this,"_onExtentChangeSliderHandler"));this._connects.push(f(a._movable,"onFirstMove",this,"_onSliderMoveStartHandler"))}else{a=this._slider=new a({id:d.id,"class":i,minimum:0,maximum:2,discreteValues:3,value:1,clickSelect:!0,intermediateChanges:k.sliderChangeImmediate,style:"height:50px; z-index:30;"},d);b=a.domNode.firstChild.childNodes;for(g=1;3>=g;g++)n(b[g],"visibility","hidden");a.startup();this._slider_connect=f(a,"onChange",
this,"_onDynSliderChangeHandler");this._connects.push(f(this,"onExtentChange",this,"_onExtentChangeDynSliderHandler"))}b=a.decrementButton;a.incrementButton.style.outline="none";b.style.outline="none";a.sliderHandle.style.outline="none";a._onKeyPress=function(){};if(a=a._movable){var s=a.onMouseDown;a.onMouseDown=function(a){9>e("ie")&&1!==a.button||s.apply(this,arguments)}}this.isZoomSlider=!0}},_onSliderMoveStartHandler:function(){h(this._slider_connect);h(this._slidermovestop_connect);this._slider_connect=
f(this._slider,"onChange",this,"_onSliderChangeDragHandler");this._slidermovestop_connect=f(this._slider._movable,"onMoveStop",this,"_onSliderMoveEndHandler")},_onSliderChangeDragHandler:function(a){this._extentUtil({targetLevel:a})},_onSliderMoveEndHandler:function(){h(this._slider_connect);h(this._slidermovestop_connect)},_onSliderChangeHandler:function(a){this.setLevel(a)},_updateSliderValue:function(a,c){h(this._slider_connect);var b=this._slider,d=b._onChangeActive;b._onChangeActive=!1;b.set("value",
a);b._onChangeActive=d;this._slider_connect=f(b,"onChange",this,c)},_onExtentChangeSliderHandler:function(a,c,b,d){h(this._slidermovestop_connect);this._updateSliderValue(d.level,"_onSliderChangeHandler")},_onDynSliderChangeHandler:function(a){this._extentUtil({numLevels:0<a?1:-1})},_onExtentChangeDynSliderHandler:function(){this._updateSliderValue(1,"_onDynSliderChangeHandler")},_openLogoLink:function(a){window.open(C.defaults.map.logoLink,"_blank");y.stop(a)},enableMapNavigation:function(){this.navigationManager.enableNavigation()},
disableMapNavigation:function(){this.navigationManager.disableNavigation()},enableDoubleClickZoom:function(){if(!this.isDoubleClickZoom)this.navigationManager.enableDoubleClickZoom(),this.isDoubleClickZoom=!0},disableDoubleClickZoom:function(){if(this.isDoubleClickZoom)this.navigationManager.disableDoubleClickZoom(),this.isDoubleClickZoom=!1},enableShiftDoubleClickZoom:function(){if(!this.isShiftDoubleClickZoom)E(this.declaredClass+": Map.(enable/disable)ShiftDoubleClickZoom deprecated. Shift-Double-Click zoom behavior will not be supported.",
null,"v2.0"),this.navigationManager.enableShiftDoubleClickZoom(),this.isShiftDoubleClickZoom=!0},disableShiftDoubleClickZoom:function(){if(this.isShiftDoubleClickZoom)E(this.declaredClass+": Map.(enable/disable)ShiftDoubleClickZoom deprecated. Shift-Double-Click zoom behavior will not be supported.",null,"v2.0"),this.navigationManager.disableShiftDoubleClickZoom(),this.isShiftDoubleClickZoom=!1},enableClickRecenter:function(){if(!this.isClickRecenter)this.navigationManager.enableClickRecenter(),this.isClickRecenter=
!0},disableClickRecenter:function(){if(this.isClickRecenter)this.navigationManager.disableClickRecenter(),this.isClickRecenter=!1},enablePan:function(){if(!this.isPan)this.navigationManager.enablePan(),this.isPan=!0},disablePan:function(){if(this.isPan)this.navigationManager.disablePan(),this.isPan=!1},enableRubberBandZoom:function(){if(!this.isRubberBandZoom)this.navigationManager.enableRubberBandZoom(),this.isRubberBandZoom=!0},disableRubberBandZoom:function(){if(this.isRubberBandZoom)this.navigationManager.disableRubberBandZoom(),
this.isRubberBandZoom=!1},enableKeyboardNavigation:function(){if(!this.isKeyboardNavigation)this.navigationManager.enableKeyboardNavigation(),this.isKeyboardNavigation=!0},disableKeyboardNavigation:function(){if(this.isKeyboardNavigation)this.navigationManager.disableKeyboardNavigation(),this.isKeyboardNavigation=!1},enableScrollWheelZoom:function(){if(!this.isScrollWheelZoom)this.navigationManager.enableScrollWheelZoom(),this.isScrollWheelZoom=!0},disableScrollWheelZoom:function(){if(this.isScrollWheelZoom)this.navigationManager.disableScrollWheelZoom(),
this.isScrollWheelZoom=!1},showPanArrows:function(){if(this._navDiv)this._navDiv.style.display="block",this.isPanArrows=!0},hidePanArrows:function(){if(this._navDiv)this._navDiv.style.display="none",this.isPanArrows=!1},showZoomSlider:function(){if(this._slider)n(this._slider.domNode||this._slider,"visibility","visible"),this.isZoomSlider=!0},hideZoomSlider:function(){if(this._slider)n(this._slider.domNode||this._slider,"visibility","hidden"),this.isZoomSlider=!1}})});