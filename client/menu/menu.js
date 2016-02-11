/**
 * Плагин Menu [menu]
 *
 * Версия: 1.0.0 (26.07.2013 23:02 +0400)
 * Author: Bogdan Nazar (nazar_bogdan@itechserv.ru)
 *
 * Требования: PHP FlexEngine Core 3.1.0 +
*/
(function(){

var __name_lib = "lib";
var __name_menu = "menu";
var __name_popup = "popup";
var __name_script = "menu.js";

//ищем render
if ((typeof render != "object") || (!render) || (typeof render.$name == "undefined")) {
	console.log(__name_script + " > Object [render] not found or is incompatible version.");
	return;
}
if (typeof render.pluginGet !="function") {
	console.log(__name_script + " > Object [render] has no method [pluginGet] or is incompatible version.");
	return;
}
if (typeof render.pluginRegister !="function") {
	console.log(__name_script + " > Object [render] has no method [pluginRegister] or is incompatible version.");
	return;
}

//плагин menu [static]
var _menu = function() {
	this._initErr	=	false;
	this._inited	=	false;
	this.$name		=	__name_menu;
	this.plRender	=	null;
};
_menu.prototype._init = function(last) {
	if (this._inited) return true;
	if (typeof last != "boolean") last = false;
	this._inited = true;
	return true;
};
render.pluginRegister(new _menu(), true);

})();