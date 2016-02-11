<?
namespace FlexEngine;
defined("FLEX_APP") or die("Forbidden.");
define("MENU_AMODE_LIST",0,false);
define("MENU_AMODE_EDIT",1,false);
final class menu extends module
{
	private static $class			=	"";
	private static $config			=	array(
		"maxLookLvls"				=>	10
	);
	private static $item			=	array();
	private static $items			=	array();
	private static $mode			=	MENU_AMODE_LIST;
	private static $modes			=	array(
		MENU_AMODE_LIST				=>	array(
			"name"					=>	"list",
			"title"					=>	"Список меню-блоков"
		),
		MENU_AMODE_EDIT				=>	array(
			"name"					=>	"edit",
			"title"					=>	"Редактирование блока меню"
		)
	);
	private static $node			=	array();
	private static $nodesPath		=	array();
	private static $paths			=	array();
	private static $uriSimbolic		=	true;

	private static function _actionSilentItemDel()
	{
		$res="{res:";
		//проверяем id
		$id=0+self::post(self::$class."-admin-item-id");
		if(!$id)
		{
			echo $res."false,msg:\"Невозможно выполнить операцию: задан неверный идентификатор меню [".$id."]\"}";
			return;
		}
		$r=self::q("SELECT * FROM ".self::tb(self::$class)." WHERE `id`=".$id,false);
		if($r===false)
		{
			echo $res."false,msg:\"Ошибка операции с базой данных\"}";
			return;
		}
		$rec=mysql_fetch_assoc($r);
		if(!$rec)
		{
			echo $res."false,msg:\"Ошибка: указанное меню [".$id."] не существует или было удалено ранее.\"}";
			return;
		}
		$r=render::unbind(self::$class,$id);
		if($r!==true)
		{
			if(is_array($r) && isset($r["msg"]))$msg=$r["msg"];
			else $msg="Ошибка удаления байндингов объекта.";
			echo $res."false,msg:\"".lib::jsonPrepare($msg)."\"}";
			return;
		}
		$r=self::q("DELETE FROM ".self::tb(self::$class."_entries")." WHERE `mid`=".$id);
		if($r===false)
		{
			echo $res."false,msg:\"Ошибка операции с базой данных\"}";
			return;
		}
		$r=self::q("DELETE FROM ".self::tb(self::$class)." WHERE `id`=".$id);
		if($r===false)
		{
			echo $res."false,msg:\"Ошибка операции с базой данных\"}";
			return;
		}
		echo $res."true,msg:\"\"}";
	}

	private static function _actionSilentItemLoad()
	{
		$res="{res:";
		//проверяем id
		$id=0+self::post(self::$class."-admin-item-id");
		if(!$id)
		{
			echo $res."false,critical:true,msg:\"Невозможно выполнить операцию: задан неверный идентификатор меню [".$id."]\"}";
			return;
		}
		$r=self::q("SELECT * FROM ".self::tb(self::$class)." WHERE `id`=".$id."",false);
		if($r===false)
		{
			echo $res."false,critical:true,msg:\"Ошибка операции с базой данных\"}";
			return;
		}
		$rec=mysql_fetch_assoc($r);
		if(!$rec)
		{
			echo $res."false,critical:true,msg:\"Ошибка: указанное меню [".$id."] не существует или было удалено ранее.\"}";
			return;
		}
		$item="{id:".$id.",act:".$rec["act"].",cache:".$rec["cache"].",lvls:".$rec["lvls"].",showtitle:".$rec["showtitle"].",alias:\"".$rec["alias"]."\",title:\"".str_replace("\"","\\\"",$rec["title"])."\"}";
		echo $res."true,msg:\"\",item:".$item."}";
	}

	private static function _actionSilentItemNew()
	{
		$res="{res:";
		$chs=array();
		if(self::posted(self::$class."-admin-item-act"))$chs["act"]=(0+self::post(self::$class."-admin-item-act"))?1:0;
		if(self::posted(self::$class."-admin-item-alias"))
		{
			$chs["alias"]=self::post(self::$class."-admin-item-alias");
			if(!$chs["alias"])
			{
				echo $res."false,msg:\"Ошибка: Алиас меню не может быть пустым.\"}";
				return;
			}
			if(lib::mquotes_gpc())$chs["alias"]=stripslashes($chs["alias"]);
			if(!preg_match("/^([a-zA-Z_]+)$/",$chs["alias"]))
			{
				echo $res."false,msg:\"Ошибка: Алиас меню содержит недопустимые символы, разрешены: [a-zA-Z_].\"}";
				return;
			}
			if(strlen($chs["alias"])>32)
			{
				echo $res."false,msg:\"Ошибка: Алиас должен быть не длиннее 32 символов.\"}";
				return;
			}
			$r=self::q("SELECT `id` FROM ".self::tb(self::$class)." WHERE `alias`='".$chs["alias"]."'",false);
			if($r===false)
			{
				echo $res."false,critical:true,msg:\"Ошибка операции с базой данных!\"}";
				return;
			}
			$rec=mysql_fetch_assoc($r);
			if($rec)
			{
				echo $res."false,msg:\"Указанный алиас уже используется в другом меню [".$rec["id"]."].\"}";
				return;
			}
		}
		if(self::posted(self::$class."-admin-item-cache"))$chs["cache"]=(0+self::post(self::$class."-admin-item-cache"))?1:0;
		if(self::posted(self::$class."-admin-item-lvls"))
		{
			$chs["lvls"]=0+self::post(self::$class."-admin-item-lvls");
			if($chs["lvls"]>self::$config["maxLookLvls"])
			{
				echo $res."false,msg:\"Ошибка: маскимальное значение глубины просмотра структуры меню не должно превышать ".(self::$config["maxLookLvls"]+1)."\"}";
				return;
			}
		}
		if(self::posted(self::$class."-admin-item-showtitle"))$chs["showtitle"]=(0+self::post(self::$class."-admin-item-showtitle"))?1:0;
		if(self::posted(self::$class."-admin-item-title"))
		{
			$chs["title"]=self::post(self::$class."-admin-item-title");
			if($chs["title"])
			{
				if(self::mquotes_gpc())$chs["title"]=stripslashes($chs["title"]);
				if(mb_strlen($chs["title"],"UTF-8")>64)
				{
					echo $res."false,msg:\"Ошибка: заголовок меню должен быть не длиннее 64 символов.\"}";
					return;
				}
			}
		}
		if(count($chs)!=6)
		{
			echo $res."false,critical:true,msg:\"Ошибка: получены неполные данные!\"}";
			return;
		}
		$r=self::q("INSERT INTO ".self::tb(self::$class)." VALUES(NULL,".$chs["act"].",".$chs["cache"].",".$chs["lvls"].",".$chs["showtitle"].",'".$chs["alias"]."','".mysql_real_escape_string($chs["title"])."')",false);
		if($r===false)
		{
			echo $res."false,critical:true,msg:\"Ошибка операции с базой данных!\"}";
			return;
		}
		$id=0+@mysql_insert_id();
		if(!$id)
		{
			echo $res."false,critical:true,msg:\"Неизвестная ошибка, меню не создано!\"}";
			return;
		}
		$r=self::q("
		SELECT * FROM (
				SELECT `id`,@i:=@i+1 AS `ord`
				FROM `fa_mod_menu`, (SELECT @i:=0) AS `ordt` ORDER BY `title`
		) `s` WHERE `s`.`id`=".$id,false);
		if($r===false)
		{
			echo $res."false,critical:true,msg:\"Ошибка операции с базой данных!\"}";
			return;
		}
		$rec=@mysql_fetch_assoc($r);
		if(!$rec)$ord=1;
		else $ord=0+$rec["ord"];
		echo $res."true,msg:\"\",item:{id:".$id.",ord:".$ord."}}";
	}

	private static function _actionSilentItemSave()
	{
		$res="{res:";
		//проверяем id
		$id=0+self::post(self::$class."-admin-item-id");
		if(!$id)
		{
			echo $res."false,critical:true,msg:\"Невозможно выполнить операцию: задан неверный идентификатор меню [".$id."]\"}";
			return;
		}
		$r=self::q("SELECT `alias` FROM ".self::tb(self::$class)." WHERE `id`=".$id."",false);
		if($r===false)
		{
			echo $res."false,critical:true,msg:\"Ошибка операции с базой данных\"}";
			return;
		}
		$rec=mysql_fetch_assoc($r);
		if(!$rec)
		{
			echo $res."false,critical:true,msg:\"Ошибка: указанное меню [".$id."] не существует или было удалено ранее.\"}";
			return;
		}
		$alias=$rec["alias"];
		$chs=array();
		if(self::posted(self::$class."-admin-item-act"))$chs["act"]=(0+self::post(self::$class."-admin-item-act"))?1:0;
		if(self::posted(self::$class."-admin-item-alias"))
		{
			$chs["alias"]=self::post(self::$class."-admin-item-alias");
			if(!$chs["alias"])
			{
				echo $res."false,msg:\"Ошибка: Алиас меню не может быть пустым.\"}";
				return;
			}
			if(lib::mquotes_gpc())$chs["alias"]=stripslashes($chs["alias"]);
			if(!preg_match("/^([a-zA-Z_]+)$/",$chs["alias"]))
			{
				echo $res."false,msg:\"Ошибка: Алиас меню содержит недопустимые символы, разрешены: [a-zA-Z_].\"}";
				return;
			}
			if(strlen($chs["alias"])>32)
			{
				echo $res."false,msg:\"Ошибка: Алиас должен быть не длиннее 32 символов.\"}";
				return;
			}
			if($alias!=$chs["alias"])
			{
				$r=self::q("SELECT `id` FROM ".self::tb(self::$class)." WHERE `alias`='".$alias."'",false);
				if($r===false)
				{
					echo $res."false,critical:true,msg:\"Ошибка операции с базой данных!\"}";
					return;
				}
				$rec=mysql_fetch_assoc($r);
				if($rec)
				{
					echo $res."false,msg:\"Указанный алиас уже используется в другом меню [".$rec["id"]."].\"}";
					return;
				}
			}
		}
		if(self::posted(self::$class."-admin-item-cache"))$chs["cache"]=(0+self::post(self::$class."-admin-item-cache"))?1:0;
		if(self::posted(self::$class."-admin-item-lvls"))
		{
			$chs["lvls"]=0+self::post(self::$class."-admin-item-lvls");
			if($chs["lvls"]>self::$config["maxLookLvls"])
			{
				echo $res."false,msg:\"Ошибка: маскимальное значение глубины просмотра структуры меню не должно превышать ".(self::$config["maxLookLvls"]+1)."\"}";
				return;
			}
		}
		if(self::posted(self::$class."-admin-item-showtitle"))$chs["showtitle"]=(0+self::post(self::$class."-admin-item-showtitle"))?1:0;
		if(self::posted(self::$class."-admin-item-title"))
		{
			$chs["title"]=self::post(self::$class."-admin-item-title");
			if($chs["title"])
			{
				if(lib::mquotes_gpc())$chs["title"]=stripslashes($chs["title"]);
				if(mb_strlen($chs["title"],"UTF-8")>64)
				{
					echo $res."false,msg:\"Ошибка: заголовок меню должен быть не длиннее 64 символов.\"}";
					return;
				}
			}
		}
		if(!count($chs))
		{
			echo $res."false,critical:true,msg:\"Ошибка: новые данные для применения изменений не найдены.\"}";
			return;
		}
		$keys=array_keys($chs);
		$slq=array();
		foreach($keys as $i=>$key)
		{
			switch($key)
			{
				case "act":
					$sql[]="`act`=".$chs["act"];
					break;
				case "alias":
					$sql[]="`alias`='".$chs["alias"]."'";
					break;
				case "cache":
					$sql[]="`cache`=".$chs["cache"];
					break;
				case "lvls":
					$sql[]="`lvls`=".$chs["lvls"];
					break;
				case "showtitle":
					$sql[]="`showtitle`=".$chs["showtitle"];
					break;
				case "title":
					$sql[]="`title`='".mysql_real_escape_string($chs["title"])."'";
					break;
			}
		}
		$r=self::q("UPDATE ".self::tb(self::$class)." SET ".implode(",",$sql)." WHERE `id`=".$id,false);
		if($r===false)
		{
			echo $res."false,critical:true,msg:\"Ошибка операции с базой данных!\"}";
			return;
		}
		echo $res."true,msg:\"\"}";
	}

	private static function _actionSilentNodePubs()
	{
		$res="{res:";
		$pubs=array();
		$mods=self::modsListAll(array("id","class","core"),array(array(0=>"act","type"=>"ttt",2=>"1","="),array("name"=>"core","type"=>"",2=>"0","=")));
		$pattern="/.*public *static *function *".self::$class."(.*)\(/";
		foreach($mods as $key=>$mod)
		{
			$file=FLEX_APP_DIR_MOD."/class.".$mod["class"]."/".$mod["class"].".php";
			if(!@file_exists($file))continue;
			$fp=@fopen($file,"r");
			if($fp===false)continue;
			$funcs=array();
			while(!@feof($fp))
			{
				$line=@fgets($fp);
				if($line===false)break;
				@preg_match($pattern,$line,$m);
				if(count($m))$funcs[]=self::$class.trim($m[1]);
			}
			@fclose($fp);
			if(count($funcs))
			{
				foreach($funcs as $key=>$name)$funcs[$key]=trim($name);
				$pubs[]=array("class"=>$mod["class"],"methods"=>$funcs);
			}

		}
		$res=array("res"=>true,"msg"=>"","pubs"=>$pubs);
		$res=lib::jsonMake($res);
		echo $res;
	}

	private static function _itemLoad()
	{
		self::$node=array();
		$id=0+self::post(self::$class."-admin-post-id");
		if(!$id)return false;
		if(isset(self::$item["_loaded"]) && ($id==self::$item["id"]))
		{
			self::_nodePathCheck();
			return true;
		}
		self::$item=array();
		$r=self::q("SELECT * FROM ".self::tb(self::$class)." WHERE `id`=".$id,true);
		$rec=@mysql_fetch_assoc($r);
		if(!$rec)return false;
		self::$item["id"]=0+$rec["id"];
		self::$item["act"]=0+$rec["act"];
		self::$item["cache"]=0+$rec["cache"];
		self::$item["lvls"]=0+$rec["lvls"];
		self::$item["showtitle"]=0+$rec["showtitle"];
		self::$item["alias"]=$rec["alias"];
		self::$item["title"]=$rec["title"];
		if(self::mquotes_runtime())self::$item["title"]=stripslashes(self::$item["title"]);
		self::$item["_loaded"]=true;
		return true;
	}

	private static function _nodePathCheck()
	{
		if(!isset(self::$node["id"]))
		{
			self::$nodesPath=array();
			return;
		}
		$c=-1;
		$f=false;
		foreach(self::$nodesPath as $key=>$node)
		{
			$c++;
			if($node["id"]==self::$node["id"])
			{
				$f=true;
				break;
			}
		}
		if($f)
		{
			$l=count(self::$nodesPath);
			for($cnt=($l-1);$cnt>$c;$cnt--)unset(self::$nodesPath[$cnt]);
		}
	}

	private static function _nodeLoad()
	{
		$id=0+self::post(self::$class."-admin-post-id");
		if(!$id)return false;
		$c=-1;
		$f=false;
		foreach(self::$nodesPath as $key=>$node)
		{
			$c++;
			if($node["id"]==$id)
			{
				$f=true;
				break;
			}
		}
		if($f)
		{
			$l=count(self::$nodesPath);
			for($cnt=($l-1);$cnt>$c;$cnt--)unset(self::$nodesPath[$cnt]);
			self::$node=self::$nodesPath[$c];
			return;
		}
		$q="SELECT `me`.`id`,`me`.`title` AS `atitle`,`c`.`title`
		FROM ".self::tb(self::$class."_entries")." `me`
		LEFT JOIN ".self::tb("content")." `c` ON `me`.`cid`=`c`.`id`
		WHERE `me`.`id`=".$id." AND `me`.`mid`=".self::$item["id"];
		$r=self::q($q,true);
		$rec=mysql_fetch_assoc($r);
		if(!$rec)return false;
		$title=$rec["atitle"];
		if(!$title)$title=$rec["title"];
		if(self::mquotes_runtime() && $title)$title=stripslashes($title);
		$node=array("id"=>(0+$rec["id"]),"title"=>$title);
		self::$node=$node;
		self::$nodesPath[]=$node;
		return true;
	}

	private static function _renderEdit()
	{
		$q="SELECT `me`.`id`,`me`.`vis`,`me`.`title` AS `atitle`,`c`.`title`
		FROM ".self::tb(self::$class."_entries")." `me`
		LEFT JOIN ".self::tb("content")." `c` ON `me`.`cid`=`c`.`id`
		WHERE `me`.`pid`=".(isset(self::$node["id"])?self::$node["id"]:"0")." AND `me`.`mid`=".self::$item["id"];
		$r=self::q($q,true);
		$title=self::$item["title"];
		if(self::mquotes_runtime())$title=stripslashes($title);
		if(count(self::$nodesPath))$title="<b class=\"root\" onclick=\"render.pluginGet('".self::$class."-admin').listOnClickItemGo(".self::$item["id"].", this)\">".$title."</b>";
		else $title="<b>".$title."</b>";
?>
		<div class="path">Редактирование меню: <?=($title.self::_renderPath())?></div>
		<table class="table" cellpadding="3" cellspacing="0" id="<?=self::$class?>-admin-nodes-list">
		<thead>
		<tr>
		<th style="width:80px;">&nbsp;</th>
		<th>Название пункта</th>
		<th style="width:160px;">Статус</th>
		<th style="width:90px;">Удалить</th>
		<th style="width:50px;">ID</th>
		</tr>
		</thead>
		<tbody>
<?
		$rendered=0;
  		while($rec=mysql_fetch_assoc($r))
  		{
  			$rendered++;
  			$id=0+$rec["id"];
  			$vis=0+$rec["vis"];
  			$title=$rec["atitle"];
  			if(!$title)$title=$rec["title"];
  			if(self::mquotes_runtime())$title=stripslashes($title);
?>
		<tr id="<?=(self::$class)?>-admin-node-row<?=$id?>">
		<td><span class="btn-edit" onclick="render.pluginGet('<?=self::$class?>-admin').nodeOnClickEdit(<?=$id?>, this)" title="Редактировать"><?=$title?></span></td>
		<td><span class="link" onclick="render.pluginGet('<?=self::$class?>-admin').nodeOnClickGo(<?=$id?>)" title="Перейти к списку подпунктов"><?=$title?></span></td>
		<td><span class="tune<?=($vis?"":" off")?>" value="vis:<?=$id?>"><?=($vis?"Отображается":"Скрыт")?></span></td>
		<td><span class="btn-del" onclick="render.pluginGet('<?=self::$class?>-admin').nodeOnClickDel(<?=$id?>, this)" title="Удалить"></span></td>
		<td><?=$id?></td>
		</tr>
<?
  		}
  		if(!$rendered)
  		{
?>		<tr><td colspan="5">Дочерние элементы отсутствуют.</td></tr><?
  		}
?>
		</tbody>
		</table>
<?
	}

	private static function _renderList()
	{
		$r=self::q("SELECT * FROM ".self::tb(self::$class)." ORDER BY `title`",true);
?>
		<table class="table" cellpadding="3" cellspacing="0" id="<?=self::$class?>-admin-list-tblist">
		<thead>
		<tr>
		<th style="width:80px;">&nbsp;</th>
		<th>Название</th>
		<th>Алиас</th>
		<th style="width:160px;">Статус</th>
		<th style="width:160px;">Заголовок</th>
		<th style="width:160px;">Кэширование</th>
		<th style="width:160px;">Глубина поиска</th>
		<th style="width:90px;">Удалить</th>
		<th style="width:50px;">ID</th>
		</tr>
		</thead>
		<tbody>
<?
		$ids=array();
  		while($rec=mysql_fetch_assoc($r))
  		{
  			$id=0+$rec["id"];
  			$ids[]=$id;
  			$act=0+$rec["act"];
  			$showTitle=0+$rec["showtitle"];
  			$cache=0+$rec["cache"];
  			$lvls=0+$rec["lvls"];
  			$alias=$rec["alias"];
  			$title=$rec["title"];
  			if(self::mquotes_runtime())$title=stripslashes($title);
?>
		<tr id="<?=(self::$class)?>-admin-item-row<?=$id?>">
		<td>
			<span class="btn-edit" onclick="render.pluginGet('<?=self::$class?>-admin').listItemEdit(<?=$id?>, this)" title="Редактировать"></span>
			<span class="btn-bind" onclick="render.pluginGet('<?=self::$class?>-admin').listOnClickItemBind(<?=$id?>, this)" title="Разместить на сайте/Изменить размещение"></span>
		</td>
		<td><span class="link" onclick="render.pluginGet('<?=self::$class?>-admin').listOnClickItemGo(<?=$id?>, this)" title="Редактировать пункты меню"><?=$title?></span></td>
		<td><?=$alias?></td>
		<td><span class="tune<?=($act?"":" off")?>" value="act:<?=$id?>"><?=($act?"Включено":"Выключено")?></span></td>
		<td><span class="tune<?=($showTitle?"":" off")?>" value="showtitle:<?=$id?>"><?=($showTitle?"Показывать":"Не показывать")?></span></td>
		<td><span class="tune<?=($cache?"":" off")?>" value="cache:<?=$id?>"><?=($cache?"Включено":"Выключено")?></span></td>
		<td><?=($lvls+1)?></td>
		<td><span class="btn-del" onclick="render.pluginGet('<?=self::$class?>-admin').listOnClickItemDel(<?=$id?>, this)" title="Удалить"></span></td>
		<td><?=$id?></td>
		</tr>
<?
  		}
?>
		</tbody>
		</table>
<?
	}

	private static function _renderPath()
	{
		$path="";
		$l=count(self::$nodesPath);
		$cnt=0;
		foreach(self::$nodesPath as $key=>$node)
		{
			$cnt++;
			if($cnt==$l) $path.="&nbsp;&nbsp;>&nbsp;&nbsp;<span class=\"path-item last\">".$node["title"]."</span>";
			else $path.="&nbsp;&nbsp;>&nbsp;&nbsp;<span class=\"path-item\" onclick=\"render.pluginGet('".self::$class."-admin').nodeOnClickGo(".$node["id"].")\">".$node["title"]."</span>";
		}
		return $path;
	}

	protected static function _on1init()
	{
		self::$class=self::_class();
		self::$item=self::sessionGet("item");
		if(!is_array(self::$item))self::$item=array();
		self::$mode=0+self::sessionGet("mode");
		self::$node=self::sessionGet("node");
		if(!is_array(self::$node))self::$node=array();
		self::$nodesPath=self::sessionGet("nodesPath");
		if(!is_array(self::$nodesPath))self::$nodesPath=array();
	}

	protected static function _on2exec()
	{
		if(self::silent())
		{
			if(self::action(self::$class."-admin-item-load"))self::_actionSilentItemLoad();
			if(self::action(self::$class."-admin-item-save"))self::_actionSilentItemSave();
			if(self::action(self::$class."-admin-item-new"))self::_actionSilentItemNew();
			if(self::action(self::$class."-admin-item-del"))self::_actionSilentItemDel();
			if(self::action(self::$class."-admin-pubs"))self::_actionSilentNodePubs();
		}
		else
		{
			self::resourceStyleAdd();
			self::resourceScriptAdd();
			if(self::action(self::$class."-admin-mode-list"))
			{
				self::$mode=MENU_AMODE_LIST;
			}
			if(self::action(self::$class."-admin-item-nodes"))
			{
				if(self::_itemLoad())self::$mode=MENU_AMODE_EDIT;
				else self::$mode=MENU_AMODE_LIST;
			}
			else
			{
				if(self::$mode==MENU_AMODE_EDIT)self::_nodePathCheck();
			}
			if(self::action(self::$class."-admin-node-go"))
			{
				self::_nodeLoad();
			}
		}
	}

	protected static function _on3render($section="")
	{
		if(!auth::admin())
		{
?>
		<div class="<?=self::$class?>">
			Доступ запрещен.
		</div>
<?
			return;
		}
?>
		<div class="<?=self::$class?>">
<?
		$modeName="unknown-mode";
		if(isset(self::$modes[self::$mode]))$modeName=self::$modes[self::$mode]["name"];
		ob_start();
		switch(self::$mode)
		{
			case MENU_AMODE_LIST:
				self::_renderList();
				break;
			case MENU_AMODE_EDIT:
				self::_renderEdit();
				break;
			default:
				echo "Unknown mode";
		}
		$cont=ob_get_contents();
		ob_end_clean();
?>
			<div class="<?=$modeName?>">
				<input type="hidden" id="<?=self::$class?>-admin-mode" name="<?=self::$class?>-admin-mode" value="<?=self::$mode?>" />
				<input type="hidden" id="<?=self::$class?>-admin-post-id" name="<?=self::$class?>-admin-post-id" value="" />
				<?=$cont?>
			</div>
		</div>
<?
	}

	/**
	* Завершение и сохранение
	*
	*/
	protected static function _on4sleep()
	{
		self::sessionSet("item",self::$item);
		self::sessionSet("mode",self::$mode);
		self::sessionSet("node",self::$node);
		self::sessionSet("nodesPath",self::$nodesPath);
	}
}
?>