//>>built
define(["dojo/_base/declare","dojo/_base/connect","dojo/_base/lang","dojo/_base/array","dojo/_base/kernel","dojo/has","dojo/keys","dojo/query","dojo/dom","dojo/dom-construct","dojo/dom-class","dojo/dom-geometry","dojo/i18n!esri/nls/jsapi","esri/kernel","esri/domUtils","esri/geometry/Extent","esri/dijit/BookmarkItem","esri/Evented"],function(m,c,n,d,g,s,o,t,p,f,e,q,i,u,j,h,l,r){return m(r,{declaredClass:"esri.dijit.Bookmarks",_eventMap:{click:!0,edit:!0,remove:!0},constructor:function(a,b){this.map=a.map;this.editable=a.editable;
this.initBookmarks=a.bookmarks;this._clickHandlers=this._mouseOverHandlers=this._mouseOutHandlers=this._removeHandlers=this._editHandlers=[];this.bookmarkDomNode=f.create("div");e.add(this.bookmarkDomNode,"esriBookmarks");this.bookmarkTable=f.create("table");e.add(this.bookmarkTable,"esriBookmarkTable");this.bookmarkDomNode.appendChild(this.bookmarkTable);b=p.byId(b);b.appendChild(this.bookmarkDomNode);this._addInitialBookmarks()},onClick:function(){},onEdit:function(){},onRemove:function(){},addBookmark:function(a){var b;
"esri.dijit.BookmarkItem"==a.declaredClass?b=a:(b=new h(a.extent),b=new l({name:a.name,extent:b}));this.bookmarks.push(b);if(this.editable){b=i.widgets.bookmarks;console.log(b);b=f.create("div",{innerHTML:"<div class='esriBookmarkLabel'>"+a.name+"</div><div title='"+b.NLS_bookmark_remove+"' class='esriBookmarkRemoveImage'><br/></div><div title='"+b.NLS_bookmark_edit+"' class='esriBookmarkEditImage'><br/></div>"});var k=g.query(".esriBookmarkEditImage",b)[0],d=g.query(".esriBookmarkRemoveImage",b)[0];
this._removeHandlers.push(c.connect(d,"onclick",this,"_removeBookmark"));this._editHandlers.push(c.connect(k,"onclick",this,"_editBookmarkLabel"))}else b=f.create("div",{innerHTML:"<div class='esriBookmarkLabel' style='width: 210px;'>"+a.name+"</div>"});e.add(b,"esriBookmarkItem");"esri.geometry.Extent"==a.extent.declaredClass||new h(a.extent);k=g.query(".esriBookmarkLabel",b)[0];this._clickHandlers.push(c.connect(k,"onclick",n.hitch(this,"_onClickHandler",a)));this._mouseOverHandlers.push(c.connect(b,
"onmouseover",function(){e.add(this,"esriBookmarkHighlight")}));this._mouseOutHandlers.push(c.connect(b,"onmouseout",function(){e.remove(this,"esriBookmarkHighlight")}));a=this.bookmarkTable;a.insertRow(this.editable?a.rows.length-1:a.rows.length).insertCell(0).appendChild(b)},removeBookmark:function(a){var b;b=g.query(".esriBookmarkLabel",this.bookmarkDomNode);b=d.filter(b,function(b){return b.innerHTML==a});d.forEach(b,function(a){a.parentNode.parentNode.parentNode.parentNode.removeChild(a.parentNode.parentNode.parentNode)});
for(b=this.bookmarks.length-1;0<=b;b--)this.bookmarks[b].name==a&&this.bookmarks.splice(b,1);this.onRemove()},hide:function(){j.hide(this.bookmarkDomNode)},show:function(){j.show(this.bookmarkDomNode)},destroy:function(){this.map=null;d.forEach(this._clickHandlers,function(a){c.disconnect(a)});d.forEach(this._mouseOverHandlers,function(a){c.disconnect(a)});d.forEach(this._mouseOutHandlers,function(a){c.disconnect(a)});d.forEach(this._removeHandlers,function(a){c.disconnect(a)});d.forEach(this._editHandlers,
function(a){c.disconnect(a)});f.destroy(this.bookmarkDomNode)},toJson:function(){var a=[];d.forEach(this.bookmarks,function(b){a.push(b.toJson())});return a},_addInitialBookmarks:function(){if(this.editable){var a=f.create("div",{innerHTML:"<div>"+i.widgets.bookmarks.NLS_add_bookmark+"</div>"});e.add(a,"esriBookmarkItem");e.add(a,"esriAddBookmark");this._clickHandlers.push(c.connect(a,"onclick",this,this._newBookmark));this._mouseOverHandlers.push(c.connect(a,"onmouseover",function(){e.add(this,"esriBookmarkHighlight")}));
this._mouseOutHandlers.push(c.connect(a,"onmouseout",function(){e.remove(this,"esriBookmarkHighlight")}));this.bookmarkTable.insertRow(0).insertCell(0).appendChild(a)}this.bookmarks=[];d.forEach(this.initBookmarks,function(a){this.addBookmark(a)},this)},_removeBookmark:function(a){this.bookmarks.splice(a.target.parentNode.parentNode.parentNode.rowIndex,1);a.target.parentNode.parentNode.parentNode.parentNode.removeChild(a.target.parentNode.parentNode.parentNode);this.onRemove()},_editBookmarkLabel:function(a){var a=
a.target.parentNode,b=q.position(a,!0),b=f.create("div",{innerHTML:"<input type='text' class='esriBookmarkEditBox' style='left:"+b.x+"px; top:"+b.y+"px;'/>"});this._inputBox=g.query("input",b)[0];this._label=g.query(".esriBookmarkLabel",a)[0];this._inputBox.value=this._label.innerHTML==i.widgets.bookmarks.NLS_new_bookmark?"":this._label.innerHTML;c.connect(this._inputBox,"onkeyup",this,function(a){switch(a.keyCode){case o.ENTER:this._finishEdit()}});c.connect(this._inputBox,"onblur",this,"_finishEdit");
a.appendChild(b);this._inputBox.focus()},_finishEdit:function(){this._inputBox.parentNode.parentNode.removeChild(this._inputBox.parentNode);var a=i.widgets.bookmarks.NLS_new_bookmark;this._label.innerHTML=""==this._inputBox.value?a:this._inputBox.value;var b=g.query(".esriBookmarkLabel",this.bookmarkDomNode);d.forEach(this.bookmarks,function(a,c){a.name=b[c].innerHTML});this.onEdit()},_newBookmark:function(){var a=this.map,b=i.widgets.bookmarks.NLS_new_bookmark,c=a.extent;if(a.spatialReference._isWrappable()){var d=
h.prototype._normalizeX(c.xmin,a.spatialReference._getInfo()).x,e=h.prototype._normalizeX(c.xmax,a.spatialReference._getInfo()).x;if(d>e){var f=a.spatialReference.isWebMercator(),j=f?2.0037508342788905E7:180,f=f?-2.0037508342788905E7:-180;Math.abs(d-j)>Math.abs(e-f)?e=j:d=f}a=new h(d,c.ymin,e,c.ymax,a.spatialReference)}else a=c;this.addBookmark(new l({name:b,extent:a}));b=g.query(".esriBookmarkItem",this.bookmarkDomNode);a={target:{parentNode:null}};a.target.parentNode=b[b.length-2];this._editBookmarkLabel(a)},
_onClickHandler:function(a){var b=a.extent;a.extent.declaredClass||(b=new h(a.extent));this.map.setExtent(b);this.onClick()}})});