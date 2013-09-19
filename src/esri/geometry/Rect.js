//>>built
define(["dojo/_base/declare","dojo/_base/lang","dojo/has","dojox/gfx/_base","esri/kernel","esri/SpatialReference","esri/geometry/Geometry","esri/geometry/Point","esri/geometry/Extent"],function(h,b,n,i,o,j,k,l,m){var g=h(k,{declaredClass:"esri.geometry.Rect",constructor:function(a,c,f,d,e){b.mixin(this,i.defaultRect);if(b.isObject(a)&&"extent"===a.type)c=a.ymax,f=a.getWidth(),d=a.getHeight(),e=a.spatialReference,a=a.xmin;if(b.isObject(a)){if(b.mixin(this,a),this.spatialReference)this.spatialReference=new j(this.spatialReference)}else this.x=
a,this.y=c,this.width=f,this.height=d,this.spatialReference=e;this.verifySR()},getCenter:function(){return new l(this.x+this.width/2,this.y+this.height/2,this.spatialReference)},offset:function(a,c){return new g(this.x+a,this.y+c,this.width,this.height,this.spatialReference)},intersects:function(a){return a.x+a.width<=this.x||a.y+a.height<=this.y||a.y>=this.y+this.height||a.x>=this.x+this.width?!1:!0},getExtent:function(){return new m(parseFloat(this.x),parseFloat(this.y)-parseFloat(this.height),
parseFloat(this.x)+parseFloat(this.width),parseFloat(this.y),this.spatialReference)},update:function(a,c,b,d,e){this.x=a;this.y=c;this.width=b;this.height=d;this.spatialReference=e;return this}});return g});