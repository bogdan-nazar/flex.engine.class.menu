/**
 * Плагин Menu [menu_admin]
 *
 * Версия: 1.0.0 (26.07.2013 23:02 +0400)
 * Author: Bogdan Nazar (nazar_bogdan@itechserv.ru)
 *
 * Требования: PHP FlexEngine Core 3.1.0 +
*/
(function(){

var __name_admin = "admin";
var __name_lib = "lib";
var __name_media = "media";
var __name_menu = "menu";
var __name_menu_admin = "menu-admin";
var __name_msgr = "msgr";
var __name_popup = "popup";
var __name_script = "menu-admin.js";

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

//плагин menu_admin [static]
var _menu_admin = function() {
	this._initErr		=	false;
	this._inited		=	false;
	this._item			=	{
		_data:				null,
		_hint:				null,
		_pu:				false,
		_req:				null,
		_state:				0,//0 - empty, 1 - loading, 2 - loaded, 3 - error
		dom:				{
			btnCnl:			null,
			btnSav:			null,
			fields:			null,
			fldAct:			null,
			fldAlias:		null,
			fldCache:		null,
			fldLvlvs:		null,
			fldShowTitle:	null,
			fldTitle:		null,
			main:			null,
			more:			null,
			pane0:			null,
			pane1:			null,
			pane2:			null,
			row:			null,
			title:			null,
			wait:			null
		},
	};
	this._itemDel		=	{
		btn:				null,
		cnf:				-1,
		id:					0
	};
	this._itemNew		=	{
		_hint:				null,
		_pu:				false,
		_req:				null,
		dom:				{
			btnCnl:			null,
			btnSav:			null,
			fields:			null,
			fldAct:			null,
			fldAlias:		null,
			fldCache:		null,
			fldLvlvs:		null,
			fldShowTitle:	null,
			fldTitle:		null,
			main:			null,
			title:			null,
			wait:			null
		},
	};
	this.$name			=	__name_menu_admin;
	this._node			=	{
		_hint:				null,
		_pu:				false,
		data:				{
			_loaded:		false,
			id:				-1
		},
		dom:				{
			btnCnl:			null,
			btnCom:			null,
			fields:			null,
			hintLink:		null,
			hintPar1:		null,
			hintPar2:		null,
			hintPar3:		null,
			hintState:		null,
			hintTarget:		null,
			hintTitle0:		null,
			hintType:		null,
			hints:			null,
			main:			null,
			more:			null,
			title:			null,
			type:			null,
			wait:			null
		},
		fields:				{
			link:			null,
			par1:			null,
			par2:			null,
			par3:			null,
			state:			null,
			target:			null,
			title0:			null,
		},
		history:			[],
		pubsForNodes:		{_loaded: false, _inpoc: false, methods: []},
		pubsForChilds:		{_loaded: false, _inpoc: false, methods: []}
	};
	this.elId						=	null;
	this.elMode						=	null;
	this.fNodeOnChangeEditType		=	null;
	this.fNodeOnChangeMore			=	null;
	this.fNodeOnClickHint			=	null;
	this.plAdmin					=	null;
	this.plLib						=	null;
	this.plMsgr						=	null;
	this.plPu						=	null;
	this.plRender					=	null;
};
_menu_admin.prototype._init = function(last) {
	if (this._inited) return true;
	if (typeof last != "boolean") last = false;
	if (this.waitPlugin(__name_lib, "plLib", last, true)) return this._inited;
	if (this.waitPlugin(__name_popup, "plPu", last, true)) return this._inited;
	if (this.waitPlugin(__name_msgr, "plMsgr", last, true)) return this._inited;
	if (this.waitPlugin(__name_admin, "plAdmin", last, true)) return this._inited;
	if (this.waitPlugin("media", "plMedia", last, true)) return this._inited;
	if (this.waitElement(this.$name + "-mode", "elMode", last)) return this._inited;
	if (this.waitElement(this.$name + "-post-id", "elId", last)) return this._inited;
	this._inited = true;
	if (this.elMode.value == "0") {
		this.plAdmin.controlBtnAdd("Создать новое меню", "add", this.listOnClickNew.bind(this));
	} else {
		this.plAdmin.controlBtnAdd("Вернуться к списку меню", "list", this.nodeOnClickGoList.bind(this));
		this.plAdmin.controlBtnAdd("Добавить пункт меню", "add", this.nodeOnClickEdit.bind(this, 0));
		this.fNodeOnChangeEditType = this.nodeOnChangeEditType.bind(this);
		this.fNodeOnClickHint = this.nodeOnClickHint.bind(this);
		this.fNodeOnChangeMore = this.nodeOnChangeMore.bind(this);
	}
	return true;
};
_menu_admin.prototype.listActionSilentItemDel = function() {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-item-del";
	r.cbFunc = this.listOnAction.bind(this);
	r.owner_store.id = this._itemDel.id;
	r.owner_store.btn = this._itemDel.btn;
	r.dataPOST[this.$name + "-item-id"] = this._itemDel.id;
	r.msgDisplay = false;
	this.plRender.silent(r);
};
_menu_admin.prototype.listActionSilentItemLoad = function(id) {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-item-load";
	r.cbFunc = this.listOnAction.bind(this);
	r.dataPOST[this.$name + "-item-id"] = id;
	r.msgDisplay = false;
	this._item._req = r;
	this.plRender.silent(r);
	this._item._state = 1;
};
_menu_admin.prototype.listActionSilentItemNew = function(data) {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-item-new";
	r.cbFunc = this.listOnAction.bind(this);
	r.owner_store = data;
	for (var c in data) {
		if (!data.hasOwnProperty(c)) continue;
		r.dataPOST[this.$name + "-item-" + c] = data[c];
	}
	r.msgDisplay = false;
	this._itemNew._req = r;
	this.plRender.silent(r);
};
_menu_admin.prototype.listActionSilentItemSave = function(data) {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-item-save";
	r.cbFunc = this.listOnAction.bind(this);
	r.owner_store = data;
	r.owner_store.row = this._item._row;
	r.dataPOST[this.$name + "-item-id"] = this._item._data.id;
	for (var c in data) {
		if (!data.hasOwnProperty(c)) continue;
		r.dataPOST[this.$name + "-item-" + c] = data[c];
	}
	this._item._req = r;
	this.plRender.silent(r);
	this._item._state = 1;
};
_menu_admin.prototype.listItemDOM = function(id) {
	this._item.dom.main = document.createElement("DIV");
	this._item.dom.main.className = __name_menu;
	var el = document.createElement("DIV");
	el.className = __name_menu_admin;
	this._item.dom.main.appendChild(el);
	this._item.dom.title = document.createElement("DIV");
	this._item.dom.title.innerHTML = "Редактирование меню [" + id + "]";
	this._item.dom.title.className = "item-title";
	el.appendChild(this._item.dom.title);
	this._item.dom.wait = document.createElement("DIV");
	this._item.dom.wait.className = "item-wait render-loader";
	this._item.dom.wait.innerHTML = "загрузка...";
	el.appendChild(this._item.dom.wait);
	this._item.dom.info = document.createElement("DIV");
	this._item.dom.info.className = "item-info";
	this._item.dom.info.style.display = "none";
	this._item.dom.info.innerHTML = "Нажмите на вопросительный знак для получения дополнительной информации.";
	el.appendChild(this._item.dom.info);
	this._item.dom.fields = document.createElement("DIV");
	this._item.dom.fields.className = "item-fields";
	this._item.dom.fields.style.display = "none";
	el.appendChild(this._item.dom.fields);
	//кнопки
	el1 = document.createElement("DIV");
	el1.className = "item-btns";
	el.appendChild(el1);
	this._item.dom.btnCnl = document.createElement("DIV");
	this._item.dom.btnCnl.className = "btn";
	this._item.dom.btnCnl.innerHTML = "Отмена";
	el1.appendChild(this._item.dom.btnCnl);
	this.plLib.eventAdd(this._item.dom.btnCnl, "click", this.listItemEditCancel.bind(this));
	this._item.dom.btnSav = document.createElement("DIV");
	this._item.dom.btnSav.className = "btn marg";
	this._item.dom.btnSav.innerHTML = "Сохранить";
	this._item.dom.btnSav.style.display = "none";
	this.plLib.eventAdd(this._item.dom.btnSav, "click", this.listOnClickItemSave.bind(this));
	el1.appendChild(this._item.dom.btnSav);
};
_menu_admin.prototype.listItemDOMFields = function() {
	//поле Заголовок
	var el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Заголовок:";
	this._item.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._item.dom.fields.appendChild(el);
	var el1 = document.createElement("DIV");
	el1.className = "icn-hint";
	this.plLib.eventAdd(el1, "click", this.listItemFieldHintSet.bind(this, this._item, el1, 0));
	el.appendChild(el1);
	this._item.dom.fldTitle = document.createElement("INPUT");
	this._item.dom.fldTitle.type = "text";
	this._item.dom.fldTitle.maxLength = 64;
	this._item.dom.fldTitle.className = "finput";
	el.appendChild(this._item.dom.fldTitle);
	//поле Алиас
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Алиас:";
	this._item.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._item.dom.fields.appendChild(el);
	el1 = document.createElement("DIV");
	el1.className = "icn-hint";
	this.plLib.eventAdd(el1, "click", this.listItemFieldHintSet.bind(this, this._item, el1, 1));
	el.appendChild(el1);
	this._item.dom.fldAlias = document.createElement("INPUT");
	this._item.dom.fldAlias.type = "text";
	this._item.dom.fldAlias.maxLength = 32;
	this._item.dom.fldAlias.className = "finput";
	el.appendChild(this._item.dom.fldAlias);
	//Флаговые поля
	el = document.createElement("DIV");
	el.className = "flags-wrap";
	this._item.dom.fields.appendChild(el);
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//Флаг отображения заголовка
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Заголовок:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._item, el3, 2));
	el2.appendChild(el3);
	this._item.dom.fldShowTitle = document.createElement("SELECT");
	this._item.dom.fldShowTitle.appendChild(new Option("не показывать","0"));
	this._item.dom.fldShowTitle.appendChild(new Option("показывать","1"));
	this._item.dom.fldShowTitle.className = "fselect";
	el2.appendChild(this._item.dom.fldShowTitle);
	//Флаг кэширования
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Кэширование:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._item, el3, 3));
	el2.appendChild(el3);
	this._item.dom.fldCache = document.createElement("SELECT");
	this._item.dom.fldCache.appendChild(new Option("выключено","0"));
	this._item.dom.fldCache.appendChild(new Option("включено","1"));
	this._item.dom.fldCache.className = "fselect";
	el2.appendChild(this._item.dom.fldCache);
	//
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//Уровни вложенности
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Глубина просмотра:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._item, el3, 4));
	el2.appendChild(el3);
	this._item.dom.fldLvls = document.createElement("SELECT");
	this._item.dom.fldLvls.appendChild(new Option("1 уровень","0"));
	this._item.dom.fldLvls.appendChild(new Option("2 уровня","1"));
	this._item.dom.fldLvls.appendChild(new Option("3 уровня","2"));
	this._item.dom.fldLvls.appendChild(new Option("4 уровня","3"));
	this._item.dom.fldLvls.appendChild(new Option("5 уровней","4"));
	this._item.dom.fldLvls.className = "fselect";
	el2.appendChild(this._item.dom.fldLvls);
	//Состояние
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Состояние:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._item, el3, 5));
	el2.appendChild(el3);
	this._item.dom.fldAct = document.createElement("SELECT");
	this._item.dom.fldAct.appendChild(new Option("выключено","0"));
	this._item.dom.fldAct.appendChild(new Option("включено","1"));
	this._item.dom.fldAct.className = "fselect";
	el2.appendChild(this._item.dom.fldAct);
};
_menu_admin.prototype.listItemNewDOM = function() {
	this._itemNew.dom.main = document.createElement("DIV");
	this._itemNew.dom.main.className = __name_menu;
	var el = document.createElement("DIV");
	el.className = __name_menu_admin;
	this._itemNew.dom.main.appendChild(el);
	this._itemNew.dom.title = document.createElement("DIV");
	this._itemNew.dom.title.innerHTML = "Новое меню";
	this._itemNew.dom.title.className = "item-title";
	el.appendChild(this._itemNew.dom.title);
	this._itemNew.dom.wait = document.createElement("DIV");
	this._itemNew.dom.wait.className = "item-wait render-loader";
	this._itemNew.dom.wait.innerHTML = "сохранение...";
	this._itemNew.dom.wait.style.display = "none";
	el.appendChild(this._itemNew.dom.wait);
	this._itemNew.dom.info = document.createElement("DIV");
	this._itemNew.dom.info.className = "item-info";
	this._itemNew.dom.info.innerHTML = "Нажмите на вопросительный знак, для получения дополнительной информации.";
	el.appendChild(this._itemNew.dom.info);
	this._itemNew.dom.fields = document.createElement("DIV");
	this._itemNew.dom.fields.className = "item-fields";
	el.appendChild(this._itemNew.dom.fields);
	this.listItemNewDOMFields();
	//кнопки
	el1 = document.createElement("DIV");
	el1.className = "item-btns";
	el.appendChild(el1);
	this._itemNew.dom.btnCnl = document.createElement("DIV");
	this._itemNew.dom.btnCnl.className = "btn";
	this._itemNew.dom.btnCnl.innerHTML = "Отмена";
	el1.appendChild(this._itemNew.dom.btnCnl);
	this.plLib.eventAdd(this._itemNew.dom.btnCnl, "click", this.listOnClickItemNewCancel.bind(this));
	this._itemNew.dom.btnSav = document.createElement("DIV");
	this._itemNew.dom.btnSav.className = "btn marg";
	this._itemNew.dom.btnSav.innerHTML = "Сохранить";
	this.plLib.eventAdd(this._itemNew.dom.btnSav, "click", this.listOnClickItemNewSave.bind(this));
	el1.appendChild(this._itemNew.dom.btnSav);
};
_menu_admin.prototype.listItemNewDOMFields = function() {
	//поле Заголовок
	var el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Заголовок:";
	this._itemNew.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._itemNew.dom.fields.appendChild(el);
	var el1 = document.createElement("DIV");
	el1.className = "icn-hint";
	this.plLib.eventAdd(el1, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el1, 0));
	el.appendChild(el1);
	this._itemNew.dom.fldTitle = document.createElement("INPUT");
	this._itemNew.dom.fldTitle.type = "text";
	this._itemNew.dom.fldTitle.maxLength = 64;
	this._itemNew.dom.fldTitle.className = "finput";
	el.appendChild(this._itemNew.dom.fldTitle);
	//поле Алиас
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Алиас:";
	this._itemNew.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._itemNew.dom.fields.appendChild(el);
	el1 = document.createElement("DIV");
	el1.className = "icn-hint";
	this.plLib.eventAdd(el1, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el1, 1));
	el.appendChild(el1);
	this._itemNew.dom.fldAlias = document.createElement("INPUT");
	this._itemNew.dom.fldAlias.type = "text";
	this._itemNew.dom.fldAlias.maxLength = 32;
	this._itemNew.dom.fldAlias.className = "finput";
	el.appendChild(this._itemNew.dom.fldAlias);
	//Флаговые поля
	el = document.createElement("DIV");
	el.className = "flags-wrap";
	this._itemNew.dom.fields.appendChild(el);
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//Флаг отображения заголовка
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Заголовок:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el3, 2));
	el2.appendChild(el3);
	this._itemNew.dom.fldShowTitle = document.createElement("SELECT");
	this._itemNew.dom.fldShowTitle.appendChild(new Option("не показывать","0"));
	this._itemNew.dom.fldShowTitle.appendChild(new Option("показывать","1"));
	this._itemNew.dom.fldShowTitle.className = "fselect";
	el2.appendChild(this._itemNew.dom.fldShowTitle);
	//Флаг кэширования
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Кэширование:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el3, 3));
	el2.appendChild(el3);
	this._itemNew.dom.fldCache = document.createElement("SELECT");
	this._itemNew.dom.fldCache.appendChild(new Option("выключено","0"));
	this._itemNew.dom.fldCache.appendChild(new Option("включено","1"));
	this._itemNew.dom.fldCache.className = "fselect";
	el2.appendChild(this._itemNew.dom.fldCache);
	//
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//Уровни вложенности
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Глубина просмотра:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el3, 4));
	el2.appendChild(el3);
	this._itemNew.dom.fldLvls = document.createElement("SELECT");
	this._itemNew.dom.fldLvls.appendChild(new Option("1 уровень","0"));
	this._itemNew.dom.fldLvls.appendChild(new Option("2 уровня","1"));
	this._itemNew.dom.fldLvls.appendChild(new Option("3 уровня","2"));
	this._itemNew.dom.fldLvls.appendChild(new Option("4 уровня","3"));
	this._itemNew.dom.fldLvls.appendChild(new Option("5 уровней","4"));
	this._itemNew.dom.fldLvls.selectedIndex = 2;
	this._itemNew.dom.fldLvls.className = "fselect";
	el2.appendChild(this._itemNew.dom.fldLvls);
	//Состояние
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Состояние:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	var el3 = document.createElement("DIV");
	el3.className = "icn-hint";
	this.plLib.eventAdd(el3, "click", this.listItemFieldHintSet.bind(this, this._itemNew, el3, 5));
	el2.appendChild(el3);
	this._itemNew.dom.fldAct = document.createElement("SELECT");
	this._itemNew.dom.fldAct.appendChild(new Option("выключено","0"));
	this._itemNew.dom.fldAct.appendChild(new Option("включено","1"));
	this._itemNew.dom.fldAct.className = "fselect";
	el2.appendChild(this._itemNew.dom.fldAct);
};
_menu_admin.prototype.listItemFieldHintSet = function(parent, icn, hint) {
	if (parent._hint) parent._hint.className = "icn-hint";
	switch (hint) {
		case 0:
			parent.dom.info.innerHTML = "Заголовок меню будет отображаться при включенной опции &laquo;Показывать заголовок&raquo;";
			break;
		case 1:
			parent.dom.info.innerHTML = "Алиас меню используется при создании шаблона как основной идентификатор css классов.";
			break;
		case 2:
			parent.dom.info.innerHTML = "Работа данной опции зависит от шаблона меню. Т.е., если заголовок не присутствует в шаблоне, то он не будет отображаться в любом случае.";
			break;
		case 3:
			parent.dom.info.innerHTML = "Кэширование зависит от глобальных установок кэша сайта. Если глобальный кэш отключен, то данная опция будет игнорироваться.";
			break;
		case 4:
			parent.dom.info.innerHTML = "Глубина просмотра влияет на корректное подсвечивание активных разделов меню.";
			break;
		case 5:
			parent.dom.info.innerHTML = "Если установлено состояние &laquo;выключено&raquo;, меню не будет отображаться на сайте.";
			break;
	}
	parent._hint = icn;
	icn.className = "icn-hint on";
};
_menu_admin.prototype.listItemFiledsCheck = function(parent) {
	if(!parent.dom.fldAlias.value) {
		parent.dom.info.innerHTML = "<b style=\"color:#ff0000;\">Поле Алиас не может быть пустым.</b>";
		parent.dom.fldAlias.focus();
		return false;
	}
	var reg = /^([A-Za-z_]+)$/;
	var val = parent.dom.fldAlias.value;
	if (!reg.test(val)) {
		parent.dom.info.innerHTML = "<b style=\"color:#ff0000;\">В поле Алиас допускаются только латинские буквы и знак нижнего подчеркивания.</b>";
		parent.dom.fldAlias.focus();
		return false;
	}
	return true;
};
_menu_admin.prototype.listItemDel = function(confirmed) {
	if ((typeof confirmed != "boolean") || (!confirmed)) return;
	if (!this._itemDel.id) return;
	if (!this._itemDel.btn || (typeof this._itemDel.btn.nodeType == "undefined")) return;
	this.listActionSilentItemDel();
	this._itemDel.btn.className = "btn-del-wait render-loader";
	this._itemDel.id = 0;
	this._itemDel.btn = null;
};
_menu_admin.prototype.listItemEdit = function(id, row) {
	if (this._item._state) return;
	if (!this._item.dom.main) this.listItemDOM(id);
	if (!this._item.dom.fldTitle) this.listItemDOMFields();
	this._item._row = row.parentNode.parentNode;
	if (this._item._pu === false)
		this._item._pu = this.plPu.add({showcloser: false, content: this._item.dom.main});
	if (this._item._pu != -1) {
		this.plPu.show(this._item._pu);
		this.listActionSilentItemLoad(id);
	} else alert("Невозможно отобразить модальное окно, произошла ошибка плагина [popup].");
};
_menu_admin.prototype.listItemEditCancel = function() {
	if (this._item._pu == -1) return;
	this.plPu.hide(this._item._pu);
	if (this._item._state == 2) {
		this._item.dom.fldTitle.value = "";
		this._item.dom.fldAlias.value = "";
		this._item.dom.fldShowTitle.selectedIndex = 0;
		this._item.dom.fldCache.selectedIndex = 0;
		this._item.dom.fldLvls.selectedIndex = 0;
		this._item.dom.fldAct.selectedIndex = 0;
		if (this._item._hint) this._item._hint.className = "icn-hint";
	}
	if (this._item._state == 3) this._item.dom.fields.innerHTML = "";
	this._item.dom.wait.innerHTML = "загрузка...";
	this._item.dom.wait.style.display = "";
	this._item.dom.info.style.display = "none";
	this._item.dom.info.innerHTML = "Нажмите на вопросительный знак, для получения дополнительной информации";
	this._item.dom.fields.style.display = "none";
	this._item.dom.btnSav.style.display = "none";
	this._item._data = null;
	this._item._req = null;
	this._item._row = null;
	this._item._state = 0;
};
_menu_admin.prototype.listOnAction = function(r) {
	switch (r.action) {
		case this.$name + "-item-del":
			if (!r.response.res) {
				r.owner_store.btn.className = "btn-del";
				this.plMsgr.dlgAlert(r.response.msg, "err");
			} else {
				var tr = r.owner_store.btn.parentNode.parentNode;
				if (tr) tr.parentNode.removeChild(tr);
			}
			break;
		case this.$name + "-item-load":
			if (!this._item._req || (r.key != this._item._req.key)) break;
			this._item.dom.wait.style.display = "none";
			if (r.response.res) {
				this._item._state = 2;
				this._item._data = r.response.item;
				this._item.dom.info.style.display = "block";
				this._item.dom.fields.style.display = "block";
				this._item.dom.btnSav.style.display = "";
				this._item.dom.fldTitle.value = this._item._data.title;
				this._item.dom.fldAlias.value = this._item._data.alias;
				this._item.dom.fldShowTitle.selectedIndex = this._item._data.showtitle;
				this._item.dom.fldCache.selectedIndex = this._item._data.cache;
				this._item.dom.fldLvls.selectedIndex = this._item._data.lvls;
				this._item.dom.fldAct.selectedIndex = this._item._data.act;
			} else {
				this._item._state = 3;
				this._item.dom.fldAct = null;
				this._item.dom.fldAlias = null;
				this._item.dom.fldCache = null;
				this._item.dom.fldLvls = null;
				this._item.dom.fldShowTitle = null;
				this._item.dom.fldTitle = null;
				this._item.dom.fields.innerHTML = "<b style=\"color:#ff0000\">ОШИБКА</b>";
				this._item.dom.fields.style.display = "block";
				this.plRender.console(r.response.msg);
			}
			break;
		case this.$name + "-item-save":
			if (r.response.res) this.listRowUpdate(this._item._req.owner_store.row, this._item._req.owner_store);
			if (!this._item._req || (r.key != this._item._req.key)) break;
			if (r.response.res) this.listItemEditCancel();
			else {
				if (typeof r.response.critical != "undefined") {
					this._item._state = 3;
					this._item.dom.wait.style.display = "none";
					this._item.dom.fields.innerHTML = "<b style=\"color:#ff0000\">ОШИБКА</b>";
					this._item.dom.fields.style.display = "block";
				} else {
					this._item._state = 0;
					this._item.dom.info.innerHTML = "<b style=\"color:#ff0000\">" + r.response.msg + "</b>";
					this._item.dom.info.style.display = "";
					this._item.dom.fields.style.display = "";
					this._item.dom.btnSav.style.display = "";
				}
			}
			break;
		case this.$name + "-item-new":
			if (r.response.res) this.listRowInsert(r.response.item, this._itemNew._req.owner_store);
			if (!this._itemNew._req || (r.key != this._itemNew._req.key)) break;
			this._itemNew.dom.wait.style.display = "none";
			if (r.response.res) this.listOnClickItemNewCancel();
			else {
				this._itemNew.dom.info.innerHTML = "<b style=\"color:#ff0000\">" + r.response.msg + "</b>";
				this._itemNew.dom.info.style.display = "";
				if (typeof r.response.critical == "undefined") {
					this._itemNew.dom.fields.style.display = "";
					this._itemNew.dom.btnSav.style.display = "";
				}
			}
			break;
	}
};
_menu_admin.prototype.listOnClickItemBind = function(id) {
};
_menu_admin.prototype.listOnClickItemDel = function(id, btn) {
	if (btn.className.indexOf("wait") != -1) return;
	this._itemDel.id = id;
	this._itemDel.btn = btn;
	if (this._itemDel.cnf != -1) this.plMsgr.dlgConfirm(this._itemDel.cnf);
	else this._itemDel.cnf = this.plMsgr.dlgConfirm("Вы уверены, что хотите удалить даное меню?", this.listItemDel.bind(this));
};
_menu_admin.prototype.listOnClickItemGo = function(id) {
	this.elId.value = id;
	this.plRender.action(this.$name + "-item-nodes");
};
_menu_admin.prototype.listOnClickItemNewCancel = function() {
	if (this._itemNew._pu == -1) return;
	this.plPu.hide(this._itemNew._pu);
	this._itemNew.dom.fldTitle.value = "";
	this._itemNew.dom.fldAlias.value = "";
	this._itemNew.dom.fldShowTitle.selectedIndex = 0;
	this._itemNew.dom.fldCache.selectedIndex = 0;
	this._itemNew.dom.fldLvls.selectedIndex = 2;
	this._itemNew.dom.fldAct.selectedIndex = 0;
	if (this._itemNew._hint) this._itemNew._hint.className = "icn-hint";
	this._itemNew.dom.wait.style.display = "none";
	this._itemNew.dom.info.style.display = "";
	this._itemNew.dom.info.innerHTML = "Нажмите на вопросительный знак, для получения дополнительной информации";
	this._itemNew.dom.fields.style.display = "";
	this._itemNew.dom.btnSav.style.display = "";
	this._itemNew._req = null;
};
_menu_admin.prototype.listOnClickItemNewSave = function() {
	if (!this.listItemFiledsCheck(this._itemNew)) return;
	var data = {};
	data.act = this._itemNew.dom.fldAct.selectedIndex;
	data.alias = this._itemNew.dom.fldAlias.value;
	data.cache = this._itemNew.dom.fldCache.selectedIndex;
	data.lvls = this._itemNew.dom.fldLvls.selectedIndex;
	data.showtitle = this._itemNew.dom.fldShowTitle.selectedIndex;
	data.title = this._itemNew.dom.fldTitle.value;
	this.listActionSilentItemNew(data);
	this._itemNew.dom.wait.style.display = "";
	this._itemNew.dom.info.style.display = "none";
	this._itemNew.dom.fields.style.display = "none";
	this._itemNew.dom.btnSav.style.display = "none";
};
_menu_admin.prototype.listOnClickItemSave = function() {
	if (!this.listItemFiledsCheck(this._item)) return;
	var data = {};
	if (this._item.dom.fldAct.selectedIndex != ("" + this._item._data.act)) data.act = this._item.dom.fldAct.selectedIndex;
	if (this._item.dom.fldAlias.value != (this._item._data.alias)) data.alias = this._item.dom.fldAlias.value;
	if (this._item.dom.fldCache.selectedIndex != ("" + this._item._data.cache)) data.cache = this._item.dom.fldCache.selectedIndex;
	if (this._item.dom.fldLvls.selectedIndex != ("" + this._item._data.lvls)) data.lvls = this._item.dom.fldLvls.selectedIndex;
	if (this._item.dom.fldShowTitle.selectedIndex != ("" + this._item._data.showtitle)) data.showtitle = this._item.dom.fldShowTitle.selectedIndex;
	if (this._item.dom.fldTitle.value != (this._item._data.title)) data.title = this._item.dom.fldTitle.value;
	var ch = 0;
	for (var c in data) {if (!data.hasOwnProperty(c)) continue; ch++;};
	if (!ch) {
		this.listItemEditCancel();
		return;
	}
	this.listActionSilentItemSave(data);
	this._item.dom.wait.innerHTML = "сохранение...";
	this._item.dom.wait.style.display = "";
	this._item.dom.info.style.display = "none";
	this._item.dom.fields.style.display = "none";
	this._item.dom.btnSav.style.display = "none";
};
_menu_admin.prototype.listOnClickNew = function() {
	if (this._itemNew._state) return;
	if (!this._itemNew.dom.main) this.listItemNewDOM();
	if (this._itemNew._pu === false)
		this._itemNew._pu = this.plPu.add({showcloser: false, content: this._itemNew.dom.main});
	if (this._itemNew._pu != -1) this.plPu.show(this._itemNew._pu);
	else this.plMsgr.dlgAlert("Невозможно отобразить модальное окно, произошла ошибка плагина [" + __name_popup + "].", "err");
};
_menu_admin.prototype.listRowInsert = function(item, data) {
	var t = document.getElementById(this.$name + "-list-tblist");
	if (!t) return;
	//создаем DOM ряда таблицы
	var row = document.createElement("TR");
	row.id = this.$name + "-item-row" + item.id;
	//кнопки
	var td = document.createElement("TD");
	var s = document.createElement("SPAN");
	s.className = "btn-edit";
	s.title = "Редактировать";
	this.plLib.eventAdd(s, "click", this.listItemEdit.bind(this, item.id, s));
	td.appendChild(s);
	row.appendChild(td);
	//
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "btn-bind";
	s.title = "Разместить на сайте/Изменить размещение";
	this.plLib.eventAdd(s, "click", this.listOnClickItemBind.bind(this, item.id));
	td.appendChild(s);
	row.appendChild(td);
	//название
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "link";
	s.innerHTML = data.title;
	this.plLib.eventAdd(s, "click", this.listOnClickItemGo.bind(this, item.id));
	td.appendChild(s);
	row.appendChild(td);
	//алиас
	td = document.createElement("TD");
	td.innerHTML = data.alias;
	row.appendChild(td);
	//статус
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "tune " + (data.act ? "" : "off");
	s.innerHTML = (data.act ? "Включено" : "Выключено");
	td.appendChild(s);
	row.appendChild(td);
	//показывать заголовок
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "tune " + (data.showtitle ? "" : "off");
	s.innerHTML = (data.showtitle ? "Показывать" : "Не показывать");
	td.appendChild(s);
	row.appendChild(td);
	//кэширование
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "tune " + (data.cache ? "" : "off");
	s.innerHTML = (data.cache ? "Включено" : "Выключено");
	td.appendChild(s);
	row.appendChild(td);
	//глубина поиска
	td = document.createElement("TD");
	td.innerHTML = data.lvls;
	row.appendChild(td);
	//кнопка удаления
	td = document.createElement("TD");
	s = document.createElement("SPAN");
	s.className = "btn-del";
	s.title = "Удалить";
	this.plLib.eventAdd(s, "click", this.listOnClickItemDel.bind(this, item.id, s));
	td.appendChild(s);
	row.appendChild(td);
	//ID
	td = document.createElement("TD");
	td.innerHTML = item.id;
	row.appendChild(td);
	//ищем позицию и вставляем ряд
	var tb = false;
	var l = t.childNodes.length;
	if (l) {
		for (var c = 0; c < l; c++) {
			if (t.childNodes[c].tagName && (t.childNodes[c].tagName.toUpperCase() == "TBODY")) {
				tb = t.childNodes[c];
				break;
			}
		}
	}
	if (!tb) tb = t;
	else l = tb.childNodes.length;
	var rows = [];
	for (var c = 0; c < l; c++) {
		if (tb.childNodes[c].tagName && (tb.childNodes[c].tagName.toUpperCase() == "TR")) {
			rows.push(tb.childNodes[c]);
		}
	}
	if (item.ord > rows.length) tb.appendChild(row);
	else {
		tb.insertBefore(row, rows[item.ord - 1]);
	}
};
_menu_admin.prototype.listRowUpdate = function(row, data) {
	var l = row.childNodes.length;
	var cells = [];
	for (var c = 0; c < l; c++) {
		if (row.childNodes[c].tagName && (row.childNodes[c].tagName.toUpperCase() == "TD")) cells.push(row.childNodes[c]);
	}
	if (cells.length != 8) return false;
	for (var c in data) {
		if (!data.hasOwnProperty(c) || (c == "row")) continue;
		switch (c) {
			case "act":
				cells[3].innerHTML = "<span class=\"tune" + (data.act ? "" : " off") + "\" value=\"act:" + data.id + "\">" + (data.act ? "Включено" : "Выключено") + "</span>";
				break;
			case "alias":
				cells[2].innerHTML = data.alias;
				break;
			case "cache":
				cells[5].innerHTML = "<span class=\"tune" + (data.cache ? "" : " off") + "\" value=\"cache:" + data.id + "\">" + (data.cache ? "Включено" : "Выключено") + "</span>";
				break;
			case "lvls":
				cells[6].innerHTML = (data.lvls + 1);
				break;
			case "showtitle":
				cells[4].innerHTML = "<span class=\"tune" + (data.showtitle ? "" : " off") + "\" value=\"showtitle:" + data.id + "\">" + (data.showtitle ? "Показывать" : "Не показывать") + "</span>";
				break;
			case "title":
				cells[1].innerHTML = "<span class=\"link\" title=\"Редактировать пункты меню\">" + data.title + "</span>";
				this.plLib.eventAdd(cells[1], "click", this.listOnClickItemGo.bind(this, data.id));
				break;
		}
	}
};
_menu_admin.prototype.nodeActionGo = function() {
	this.plRender.action(this.$name + "-node-go");
};
_menu_admin.prototype.nodeActionGoList = function() {
	this.plRender.action(this.$name + "-mode-list");
};
_menu_admin.prototype.nodeActionSilentFetch = function(id) {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-node-fetch";
	r.cbFunc = this.nodeOnAction.bind(this);
	r.dataPOST[this.$name + "-node-id"] = id;
	r.msgDisplay = false;
	this._node._req = r;
	//this.plRender.silent(r);
};
_menu_admin.prototype.nodeActionSilentPubsChilds = function() {
	var r = this.plRender.silentReqBuild(this);
	r.action = this.$name + "-pubs";
	r.cbFunc = this.nodeOnAction.bind(this);
	r.msgDisplay = false;
	this._node._req = r;
	this.plRender.silent(r);
};
_menu_admin.prototype.nodeDOMEdit = function() {
	//popup-контейнер
	this._node.dom.main = document.createElement("DIV");
	this._node.dom.main.className = __name_menu;
	var el = document.createElement("DIV");
	el.className = __name_menu_admin;
	this._node.dom.main.appendChild(el);
	var el1 = document.createElement("DIV");
	el1.className = "node-edit";
	el.appendChild(el1);
	//заголовок
	this._node.dom.title = document.createElement("DIV");
	this._node.dom.title.innerHTML = "Редактирование";
	this._node.dom.title.className = "title";
	el1.appendChild(this._node.dom.title);
	//загрузчик
	this._node.dom.wait = document.createElement("DIV");
	this._node.dom.wait.className = "wait render-loader";
	this._node.dom.wait.innerHTML = "получение данных...";
	el1.appendChild(this._node.dom.wait);
	//область подсказок
	this._node.dom.hints = document.createElement("DIV");
	this._node.dom.hints.className = "hints-area";
	this._node.dom.hints.style.display = "none";
	this._node.dom.hints.innerHTML = "Нажмите на вопросительный знак для получения дополнительной информации.";
	el1.appendChild(this._node.dom.hints);
	//контейнер для полей
	this._node.dom.fields = document.createElement("DIV");
	this._node.dom.fields.className = "fields";
	this._node.dom.fields.style.display = "none";
	el1.appendChild(this._node.dom.fields);
	//кнопки
	el2 = document.createElement("DIV");
	el2.className = "buttons";
	el1.appendChild(el2);
	this._node.dom.btnCnl = document.createElement("DIV");
	this._node.dom.btnCnl.className = "btn";
	this._node.dom.btnCnl.innerHTML = "Отмена";
	el2.appendChild(this._node.dom.btnCnl);
	this.plLib.eventAdd(this._node.dom.btnCnl, "click", this.nodeOnClickEditCancel.bind(this));
	this._node.dom.btnCom = document.createElement("DIV");
	this._node.dom.btnCom.className = "btn marg";
	this._node.dom.btnCom.innerHTML = "Сохранить";
	this._node.dom.btnCom.style.display = "none";
	this.plLib.eventAdd(this._node.dom.btnCom, "click", this.nodeOnClickEditCommit.bind(this));
	el2.appendChild(this._node.dom.btnCom);
};
_menu_admin.prototype.nodeDOMEditFields = function(data) {
	var d = this._node.dom;
	var f = this._node.fields;
	//поле Тип ссылки
	var el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Выберите тип ссылки:";
	this._node.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._node.dom.fields.appendChild(el);
	d.hintType = document.createElement("DIV");
	d.hintType.className = "icn-hint 0";
	this.plLib.eventAdd(d.hintType, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintType);
	d.type = document.createElement("SELECT");
	d.type.className = "fselect type";
	d.type.appendChild(new Option("статическая ссылка","0"));
	d.type.appendChild(new Option("привязать страницу","1"));
	d.type.appendChild(new Option("внешний (из другого модуля)","2"));
	var tpi = 0;
	if (data) {
		if (data.cid) tpi = 1;
		if (data.ext) tpi = 2;
		d.type.selectedIndex = tpi;
	}
	this.plLib.eventAdd(d.type, "change", this.fNodeOnChangeEditType);
	el.appendChild(d.type);
	//контейнер 2-х колоночной подгруппы
	el = document.createElement("DIV");
	el.className = "flags-wrap";
	this._node.dom.fields.appendChild(el);
	//1я колонка
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//поле Состояние
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Состояние:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	d.hintState = document.createElement("DIV");
	d.hintState.className = "icn-hint 1";
	this.plLib.eventAdd(d.hintState, "click", this.fNodeOnClickHint);
	el2.appendChild(d.hintState);
	f.state = document.createElement("SELECT");
	f.state.appendChild(new Option("не показывать","0"));
	f.state.appendChild(new Option("показывать","1"));
	f.state.className = "fselect flag";
	el2.appendChild(f.state);
	//разделитель
	el1 = document.createElement("DIV");
	el1.className = "flags-sp";
	el.appendChild(el1);
	//2я колонка
	el1 = document.createElement("DIV");
	el1.className = "flags";
	el.appendChild(el1);
	//поле Состояние
	el2 = document.createElement("DIV");
	el2.className = "fld-title";
	el2.innerHTML = "Окно назначения:";
	el1.appendChild(el2);
	el2 = document.createElement("DIV");
	el2.className = "fld-wrap2";
	el1.appendChild(el2);
	d.hintTarget = document.createElement("DIV");
	d.hintTarget.className = "icn-hint 2";
	this.plLib.eventAdd(d.hintTarget, "click", this.fNodeOnClickHint);
	el2.appendChild(d.hintTarget);
	f.target = document.createElement("SELECT");
	f.target.appendChild(new Option("текущее","_self"));
	f.target.appendChild(new Option("новое","_blank"));
	f.target.className = "fselect flag";
	el2.appendChild(f.target);
	//
	//контейнер группы полей Статическая ссылка
	d.pane0 = document.createElement("DIV");
	d.pane0.className = "fld-group";
	if (tpi != 0) d.pane0.style.display = "none";
	this._node.dom.fields.appendChild(d.pane0);
	//контейнер группы полей Привязать страницу
	d.pane1 = document.createElement("DIV");
	d.pane1.className = "fld-group";
	if (tpi != 1) d.pane1.style.display = "none";
	this._node.dom.fields.appendChild(d.pane1);
	//контейнер группы полей Внешний пункт меню
	d.pane2 = document.createElement("DIV");
	d.pane2.className = "fld-group";
	if (tpi != 2) d.pane1.style.display = "none";
	this._node.dom.fields.appendChild(d.pane2);
	//
	//группа полей Статическая ссылка
	//заголовок ссылки
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Текст:";
	d.pane0.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.pane0.appendChild(el);
	d.hintTitle0 = document.createElement("DIV");
	d.hintTitle0.className = "icn-hint 3";
	this.plLib.eventAdd(d.hintTitle0, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintTitle0);
	f.title0 = document.createElement("INPUT");
	f.title0.type = "text";
	f.title0.maxLength = "64";
	el.appendChild(f.title0);
	//ссылка
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Ссылка:";
	d.pane0.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.pane0.appendChild(el);
	d.hintLink = document.createElement("DIV");
	d.hintLink.className = "icn-hint 4";
	this.plLib.eventAdd(d.hintLink, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintLink);
	f.link = document.createElement("INPUT");
	f.link.type = "text";
	f.link.maxLength = "255";
	el.appendChild(f.link);
	//
	//группа полей Привязать страницу
	//заголовок ссылки
	//
	//группа полей Внешний пункт меню
	//заголовок ссылки
	//
	//Дополнительные параметры шаблона
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Дополнительные параметры ссылки:";
	this._node.dom.fields.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	this._node.dom.fields.appendChild(el);
	d.moreSel = document.createElement("SELECT");
	d.moreSel.className = "fselect type";
	d.moreSel.appendChild(new Option("игнорировать","0"));
	d.moreSel.appendChild(new Option("задать","1"));
	var mshow = 0;
	if (data) {
		if (data.par1 || data.par2 || data.par3 || data.extchilds) mshow = 1;
	}
	d.moreSel.selectedIndex = mshow;
	this.plLib.eventAdd(d.moreSel, "change", this.fNodeOnChangeMore);
	el.appendChild(d.moreSel);
	d.more = document.createElement("DIV");
	d.more.className = "grp-more";
	this._node.dom.fields.appendChild(d.more);
	if (mshow) d.more.style.display = "block";
	//параметр 1
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Дополнительный параметр шаблона №1:";
	d.more.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.more.appendChild(el);
	d.hintPar1 = document.createElement("DIV");
	d.hintPar1.className = "icn-hint 9";
	this.plLib.eventAdd(d.hintPar1, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintPar1);
	f.par1 = document.createElement("INPUT");
	f.par1.type = "text";
	f.par1.maxLength = "16";
	el.appendChild(f.par1);
	//параметр 2
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Дополнительный параметр шаблона №2:";
	d.more.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.more.appendChild(el);
	d.hintPar2 = document.createElement("DIV");
	d.hintPar2.className = "icn-hint 10";
	this.plLib.eventAdd(d.hintPar2, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintPar2);
	f.par2 = document.createElement("INPUT");
	f.par2.type = "text";
	f.par2.maxLength = "16";
	el.appendChild(f.par2);
	//параметр 3
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Дополнительный параметр шаблона №3:";
	d.more.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.more.appendChild(el);
	d.hintPar3 = document.createElement("DIV");
	d.hintPar3.className = "icn-hint 11";
	this.plLib.eventAdd(d.hintPar3, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintPar3);
	f.par3 = document.createElement("INPUT");
	f.par3.type = "text";
	f.par3.maxLength = "16";
	el.appendChild(f.par3);
	//Поиск дочерних элементов
	el = document.createElement("DIV");
	el.className = "fld-title";
	el.innerHTML = "Поиск дочерних узлов:";
	d.more.appendChild(el);
	el = document.createElement("DIV");
	el.className = "fld-wrap";
	d.more.appendChild(el);
	d.hintExtChilds = document.createElement("DIV");
	d.hintExtChilds.className = "icn-hint 12";
	this.plLib.eventAdd(d.hintExtChilds, "click", this.fNodeOnClickHint);
	el.appendChild(d.hintExtChilds);
	f.extchilds = document.createElement("INPUT");
	f.extchilds.type = "hidden";
	el.appendChild(f.extchilds);
	d.extChilds = document.createElement("SELECT");
	d.extChilds.className = "fselect type";
	d.extChilds.appendChild(new Option("автоматически","0"));
	d.extChilds.appendChild(new Option("выбрать модуль-источник","1"));
	el.appendChild(d.extChilds);
};
_menu_admin.prototype.nodeDOMEditReset = function() {
	this.plLib.eventRemove(this._node.dom.type, "change", this.fNodeOnChangeEditType);
	this.plLib.eventRemove(this._node.dom.hintType, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintState, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintTarget, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintTitle0, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintLink, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintPar1, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintPar2, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.hintPar3, "click", this.fNodeOnClickHint);
	this.plLib.eventRemove(this._node.dom.moreSel, "change", this.fNodeOnChangeMore);
	this._node.dom.fields.innerHTML = "";
};
_menu_admin.prototype.nodeOnAction = function(r) {
	switch (r.action) {
		case this.$name + "-node-fetch":
			if (!r.response.res) {
				r.owner_store.btn.className = "btn-del";
				this.plMsgr.dlgAlert(r.response.msg, "err");
			} else {
				var tr = r.owner_store.btn.parentNode.parentNode;
				if (tr) tr.parentNode.removeChild(tr);
			}
			break;
	}
};
_menu_admin.prototype.nodeOnChangeEditType = function() {
};
_menu_admin.prototype.nodeOnClickEdit = function(id, trigger) {
	if (this._node.data.id > -1) {
		this.plMsgr.dlgAlert("Окно редактирования элемента занято или произошла неизвестная ошибка", "wrn");
		return;
	}
	if (!this._node.dom.main) {
		this.nodeDOMEdit();
		if (this._node._pu === false)
			this._node._pu = this.plPu.add({showcloser: false, content: this._node.dom.main});
	}
	if (this._node._pu == -1) {
		this.plMsgr.dlgAlert("Невозможно отобразить модальное окно, произошла ошибка плагина [" + __name_popup + "].", "err");
		return;
	}
	this._node.data.id = id;
	if (id > 0)	{
		this._node.dom.title.innerHTML = "Редактирование элемента меню [" + id + ": \"" + trigger.innerHTML + "\"]";
		this.nodeActionSilentFetch(id);
	} else {
		this._node.dom.title.innerHTML = "Новый элемент меню";
		this.nodeDOMEditFields(false);
		this._node.data._loaded = true;
		this._node.dom.wait.style.display = "none";
		this._node.dom.hints.style.display = "";
		this._node.dom.fields.style.display = "";
		this._node.dom.btnCom.style.display = "";
	}
	this.plPu.show(this._node._pu);
	this.nodeActionSilentPubsChilds();
};
_menu_admin.prototype.nodeOnClickEditCancel = function() {
	this.plPu.hide(this._node._pu)
	if (this._node.data._loaded) {
		if (this._node.data.id) this._node.history.push(this._node.data);
		this.nodeDOMEditReset();
	}
	this._node.data = {_loaded: false, id: -1};
	this._node.dom.title.innerHTML = "Редактирование";
	this._node.dom.wait.style.display = "";
	this._node.dom.wait.className = "wait render-loader";
	this._node.dom.hints.style.display = "none";
	this._node.dom.fields.style.display = "none";
	this._node.dom.btnCom.style.display = "none";
	this._node.data.id = -1;
};
_menu_admin.prototype.nodeOnClickEditCommit = function() {
};
_menu_admin.prototype.nodeOnClickGo = function(id) {
	if (typeof id == "undefined") return;
	this.elId.value = id;
	this.nodeActionGo();
};
_menu_admin.prototype.nodeOnClickGoList = function() {
	this.nodeActionGoList();
};
_menu_admin.prototype.nodeOnClickHint = function(e) {
	e = this.plLib.eventFix(e);
	var icn = e.target;
	if ((this._node._hint) && (this._node._hint == icn)) return;
	var p = icn.className.split(" ");
	if (p.length < 2) return;
	var i = parseInt(p[1], 10);
	if (isNaN(i)) return;
	if (this._node._hint) this._node._hint.className = this._node._hint.className.replace(" on", "");
	switch (i) {
		case 0:
			this._node.dom.hints.innerHTML =
			"1) Статическая ссылка - полный или отностильный URL-адрес, например:<br />&nbsp;&nbsp;&nbsp;/someurl_sec1/somepage<br />или<br />&nbsp;&nbsp;&nbsp;http://somedomain.com<br />" +
			"2) Привязать страницу - ссылка (URL) на выбранную страницу будет создаваться автоматически, исходя ее из положения в структуре меню и параметра ядра CORE_URI_PARSE_...<br />" +
			"3) Внешний (из другого модуля) - URL и текст пункта меню будет запрашиваться у другого модуля, путем выполнения указанной функции";
			break;
		case 1:
			this._node.dom.hints.innerHTML = "В состоянии \"не показывать\" данная ссылка/кнопка НЕ будет отображаться в меню, но, тем не менее, будет учавствовать в построении активного дерева меню";
			break;
		case 2:
			this._node.dom.hints.innerHTML = "Выбор окна назначения при клике на ссылку: либо в текущем окне, либо в новом";
			break;
		case 3:
			this._node.dom.hints.innerHTML = "Текст ссылки или кнопки пункта меню (в зависимости от шаблона)";
			break;
		case 4:
			this._node.dom.hints.innerHTML = "Полный или отностильный URL-адрес, например:<br />&nbsp;&nbsp;&nbsp;/someurl_sec1/somepage<br />или<br />&nbsp;&nbsp;&nbsp;http://somedomain.com";
			break;
		default:
			this._node.dom.hints.innerHTML = "нет описания";
	}
	this._node._hint = icn;
	icn.className = icn.className + " on";
};
_menu_admin.prototype.nodeOnChangeMore = function() {
	if (this._node.dom.moreSel.selectedIndex) this._node.dom.more.style.display = "block";
	else this._node.dom.more.style.display = "";
};
_menu_admin.prototype.waitElement = render.sharedWaitElement;
_menu_admin.prototype.waitPlugin = render.sharedWaitPlugin;
render.pluginRegister(new _menu_admin(), true);

})();