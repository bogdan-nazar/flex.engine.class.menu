<?
namespace FlexEngine;
defined("FLEX_APP") or die("Forbidden.");
final class menu
{
	private static $c				=	NULL;
	private static $class			=	__CLASS__;
	private static $cacheTTL		=	300;
	private static $items			=	array();
	private static $paths			=	array();
	private static $session			=	array();
	private static $uriSimbolic		=	true;

	private static function _entriesLoad($menu,&$parent)
	{
		if(self::$items[$menu]["lvlcur"]>self::$items[$menu]["lvls"])return;
		if(!$parent)$parent=&self::$items[$menu];
		if(!isset($parent["id"]))$pid=0;
		else $pid=0+$parent["id"];
		$nodes=array();
		if(isset($parent["extchilds"]) && $parent["extchilds"])
		{
			//пытаемся взять данные из внешнего модуля
			$extchilds=@unserialize($parent["extchilds"]);
			if($extchilds===false)
			{
				$parent["extchilds"]=false;
				return;
			}
			if(class_exists(__NAMESPACE__."\\".$extchilds["class"]) && method_exists(__NAMESPACE__."\\".$extchilds["class"],$extchilds["method"]))
				$nodes=call_user_func(array(__NAMESPACE__."\\".$extchilds["class"],$extchilds["method"]),$parent);
			if(!is_array($nodes))return;
		}
		else
		{
			//берем данные из БД
			$q="SELECT `me`.`id`,`me`.`cid`,`me`.`target`,`me`.`title` AS `atitle`,`me`.`link`,
			`c`.`alias`,`c`.`title`,`me`.`par1`,`me`.`par2`,`me`.`par3`,`me`.`ext`,`me`.`extchilds`
			FROM ".db::tnm(self::$class."_entries")." `me`
			LEFT JOIN ".db::tnm("content")." `c` ON `me`.`cid`=`c`.`id`
			WHERE `me`.`mid`={$menu} AND `me`.`vis`=1 AND `me`.`pid`=".$pid." ORDER BY `me`.`ord`";
			$r=db::q($q,true);
			while($row=mysql_fetch_assoc($r))$nodes[]=$row;
		}
		if(!is_array($nodes) || !count($nodes))return;
		self::$uriSimbolic=self::$c->path("simbolic");
		$parent["entries"]=array();
		$cnt=0;
		//проверяем полученные данные и формируем из них узлы
		foreach($nodes as $key=>$item)
		{
			$cnt++;
			if(isset($item["ext"]) && $item["ext"])
			{
				//пытаемся получить узел из внешнего модуля
				$ext=@unserialize($item["ext"]);
				if($ext===false)continue;
				if(!isset($ext["class"]) || !isset($ext["method"]))continue;
				$par1=isset($item["par1"])?$item["par1"]:"";
				$par2=isset($item["par2"])?$item["par2"]:"";
				$par3=isset($item["par3"])?$item["par3"]:"";
				if(@class_exists(__NAMESPACE__."\\".$ext["class"]) && @method_exists(__NAMESPACE__."\\".$ext["class"],$ext["method"]))
					$extnode=@call_user_func(array(__NAMESPACE__."\\".$ext["class"],$ext["method"]),$menu,$par1,$par2,$par3);
				if(!is_array($extnode))continue;
				//заполняем item значениями из $extnode
				foreach($item as $key=>$val)
					if(isset($extnode[$key]))$item[$key]=$extnode[$key];
			}
			else
			{
				if(!isset($item["alias"]) && !isset($item["link"]))continue;
				if(!$item["alias"] && !$item["link"])continue;
			}
			//создаем новый узел
			$parent["entries"][]=array();
			$node=&$parent["entries"][count($parent["entries"])-1];
			//заполняем его из item
			if(!isset($item["id"]))$node["id"]=0;
			else $node["id"]=0+$item["id"];
			$node["parent"]=$parent;
			if(!isset($item["cid"]))$node["cid"]=0;
			else $node["cid"]=0+$item["cid"];
			if(!$node["cid"] && !self::$uriSimbolic)continue;
			if(!isset($item["target"]))$node["target"]="_self";
			else $node["target"]=$item["target"];
			if(!isset($item["atitle"]))$node["atitle"]="";
			else $node["atitle"]=$item["atitle"];
			if(!isset($item["link"]))$node["link"]="";
			else $node["link"]=$item["link"];
			if(!isset($item["alias"]))$node["alias"]="";
			else $node["alias"]=$item["alias"];
			if(!isset($item["par1"]))$node["par1"]="";
			else $node["par1"]=$item["par1"];
			if(!isset($item["par2"]))$node["par2"]="";
			else $node["par2"]=$item["par2"];
			if(!isset($item["par3"]))$node["par3"]="";
			else $node["par3"]=$item["par3"];
			if(!isset($item["title"]))$node["title"]="";
			else $node["title"]=$item["title"];
			if(self::$uriSimbolic)
				$pathcur=implode("/",self::$items[$menu]["pathcur"]);
			else
				$pathcur="";
			if(!$node["link"])
			{
				if(self::$uriSimbolic)
					$node["link"]=self::$c->appRoot().(self::$c->config("","uriParseType")==CORE_URI_PARSE_FIRSTSECT?$node["alias"]:$pathcur);
				else
				{
					//ищем по цепочек родителей валидный cid
					$cid=$node["cid"];
					if(!$cid)
					{
						$i=$node;
						while(true)
						{
							if(!isset($i["parent"]["cid"]))break;
							else
								if($i["parent"]["cid"]>0)
								{
									$cid=$i["parent"]["cid"];
									break;
								}
								else $i=$i["parent"];
						}
						//при исключении - на главную
						if(!$cid)$cid=1;
					}
					$node["link"]=self::$c->appRoot()."?pid=".$cid;
				}
			}
			else
				if(!$node["alias"])$node["alias"]="extal".$cnt;
			if($node["atitle"])$node["title"]=$node["atitle"];
			if(!$node["title"] && !$node["atitle"])$node["atitle"]="Unknown menu node";
			if(isset($item["extchilds"]))$node["extchilds"]=$item["extchilds"];
			else $node["extchilds"]="";
			//запоняем карту узла
			$node["map"]=self::$items[$menu]["lvlcur"]."-".$node["cid"].(self::$uriSimbolic?"-".$node["alias"]:"");
			self::$items[$menu]["map"][$node["map"]]=array();
			$mn=&self::$items[$menu]["map"][$node["map"]];
			if($node["cid"])$mn[]=$node["cid"];
			$i=$node;
			while(true)
			{
				if(!isset($i["parent"]["cid"]))break;
				else if($i["parent"]["cid"])array_unshift($mn,$i["parent"]["cid"]);
				$i=$i["parent"];
			}
			self::$items[$menu]["lvlcur"]++;
			$ai=self::$c->config("","appIndex");
			if($node["alias"]!=$ai)array_push(self::$items[$menu]["pathcur"],$node["alias"]);
			self::_entriesLoad($menu,$node);
			unset($node["parent"]);
			if($node["alias"]!=$ai)array_pop(self::$items[$menu]["pathcur"]);
			self::$items[$menu]["lvlcur"]--;
		}
	}

	/**
	* Запись данных в сессию
	*
	*/
	private static function _sessionRead()
	{
		if(isset($_SESSION[self::$class."Data"]))
			self::$session=unserialize($_SESSION[self::$class."Data"]);
	}

	/**
	* Чтение данных из сессии
	*
	*/
	private static function _sessionWrite()
	{
		if(count(self::$session))
			$_SESSION[self::$class."Data"]=serialize(self::$session);
	}

	/**
	* put your comment there...
	*
	*/
	public static function _exec()
	{
		self::$uriSimbolic=self::$c->path("simbolic");
		self::$c->renderAddStyle(self::$class);
		render::addScript(self::$class);
	}

	/**
	* Инициализация данного модуля
	*
	* @param int $pageId - конечная/активная страница структуры
	*
	* @return bool $pageFound
	*/
	public static function _init()
	{
		if(strpos(self::$class,"\\")!==false)
		{
			$cl=explode("\\",self::$class);
			self::$class=$cl[count($cl)-1];
		}
		self::$c=_a::core();
		self::_sessionRead();
	}

	public static function _render()
	{
		$menu=func_get_arg(0);
		/*
		временный билдер меню
		if($menu==1)
		{
			$ar=serialize(array("class"=>"phpbb","method"=>"menuGen"));
			db::q("UPDATE ".db::tnm(self::$class."_entries")." SET `ext`='".addslashes($ar)."' WHERE `id` IN (5,6)",false);
		}
		$ar=serialize(array("class"=>"blog","method"=>"menuGen"));
		db::q("UPDATE ".db::tnm(self::$class."_entries")." SET `extchilds`='{$extdata}' WHERE `id` in (3, 4, 5, 6)",true);
		*/
		if(is_null($menu))return;
		$menu=0+$menu;
		/*
		$cache=cache::get(self::$class,"menu".$menu,self::$cacheTTL,false);
		if($cache!==false)
		{
			self::$items[$menu]=@unserialize($cache);
			if(!is_array(self::$items[$menu]))unset(self::$items[$menu]);
		}
		*/
		if(!isset(self::$items[$menu]))
		{
			$q="SELECT `cache`,`lvls`,`showtitle`,`alias`,`title` FROM ".db::tnm(self::$class)." WHERE `id`=".$menu." AND `act`=1";
			$r=db::q($q,true);
			$row=@mysql_fetch_assoc($r);
			if(!$row)return;
			self::$items[$menu]["cache"]=0+$row["cache"];
			self::$items[$menu]["lvls"]=0+$row["lvls"];
			self::$items[$menu]["showtitle"]=0+$row["showtitle"];
			self::$items[$menu]["alias"]=$row["alias"];
			self::$items[$menu]["title"]=$row["title"];
			self::$items[$menu]["lvlcur"]=0;
			self::$items[$menu]["map"]=array();
			self::$items[$menu]["pathcur"]=array();
			self::$items[$menu]["entries"]=array();
			self::_entriesLoad($menu,self::$items[$menu]);
		}
		$cnt=count(self::$items[$menu]["entries"]);
		$t=tpl::get(self::$class,self::$items[$menu]["alias"]);
		if(self::$items[$menu]["showtitle"])
		{
			$t->setVar("menu-show","show");
			$t->setVar("menu-title",self::$items[$menu]["title"]);
		}
		if(!$cnt)
		{
			$t->setArrayCycle("entries",array());
			$t->_echo();
			if(self::$items[$menu]["cache"])cache::set(self::$class,"menu".$menu,self::$cacheTTL,@serialize(self::$items[$menu]));
			return;
		}
		$data=array();
		$cur=0;
		$itemAct=false;
		$itemAct1=false;
		self::$uriSimbolic=self::$c->path("simbolic");
		foreach(self::$items[$menu]["entries"] as $key=>$props)
		{
			$cur++;
			$item=array();
			$item["alias"]=$props["alias"];
			$item["link"]=$props["link"];
			$item["title"]=$props["title"];
			$item["par1"]=$props["par1"];
			$item["par2"]=$props["par2"];
			$item["par3"]=$props["par3"];
			$act=self::pathHasNode($menu,$props);
			$item["class"]="";
			if($act)
			{
				$item["class"]=" act";
				$itemAct=$item["title"];
			}
			if($cur==$cnt)$item["class"].=" last";
			$item["nochilds"]=" nochilds";
			if(self::$items[$menu]["lvls"]>0)
			{
				$item["childs"]=array();
				if(isset($props["entries"]))
				{
					$cur1=0;
					$cnt1=count($props["entries"]);
					foreach($props["entries"] as $key1=>$props1)
					{
						$cur1++;
						$subitem=array();
						$subitem["child-alias"]=$props1["alias"];
						$subitem["child-link"]=$props1["link"];
						$subitem["child-title"]=$props1["title"];
						$subitem["child-par1"]=$props1["par1"];
						$subitem["child-par2"]=$props1["par2"];
						$subitem["child-par3"]=$props1["par3"];
						$act1=self::pathHasNode($menu,$props1);
						$subitem["child-class"]="";
						if($act1)
						{
							$subitem["child-class"]=" act";
							$itemAct1=$subitem["child-title"];
						}
						if($cur1==$cnt1)$subitem["child-class"].=" last";
						$item["childs"][]=$subitem;
					}
					if($cur1>0)$item["nochilds"]=" haschilds";
				}
			}
			$data[]=$item;
		}
		if($itemAct)
			$t->setVar("section-cur-title",$itemAct);
		$t->setArrayCycle("entries",$data);
		$t->_echo();
		if(self::$items[$menu]["cache"])cache::set(self::$class,"menu".$menu,self::$cacheTTL,@serialize(self::$items[$menu]));
	}

	/**
	* Завершение и сохранение
	*
	*/
	public static function _sleep()
	{
		self::_sessionWrite();
	}

	/**
	* Функция находит текущий путь для указанного контента
	* или текущего контента
	*
	* @param int $menu - идентификатор меню
	* @param array $cont - id и alias контента
	*/
	public static function pathFind($menu, $cont=false)
	{
		if(!isset(self::$items[$menu]) || !self::$items[$menu]["map"])
		{
			if($cont===false)
			{
				if(isset(self::$items[$menu]))self::$paths[$menu]=array();
				return;
			}
			else return array();
		}
		$id="noid";
		$alias="";
		if($cont===false)
		{
			if(isset(self::$paths[$menu]))return;
			$cid=self::$c->content("id");
			if(self::$uriSimbolic)
				$alias="-".self::$c->content("alias");
		}
		else
		{
			if(!is_array($cont) || !isset($cont["id"]) || (self::$uriSimbolic && !isset($cont["alias"])))return array();
			$cid=$cont["id"];
			if(self::$uriSimbolic)
				$alias="-".$cont["alias"];
		}
		$fp=false;
		foreach(self::$items[$menu]["map"] as $key=>$path)
		{
			if(strpos($key,"-".$cid.$alias)!==false)
			{
				$fp=self::$items[$menu]["map"][$key];
				break;
			}
		}
		if(!$fp)
		{
			if($cont===false)
			{
				self::$paths[$menu]=array();
				return;
			}
			else return array();
		}
		else
		{
			if($cont===false)self::$paths[$menu]=$fp;
			else return $fp;
		}
	}

	/**
	* Определение наличия страницы(/текущей страницы)
	* в указанной ветке структуры
	*
	* @param int $menu - идентификатор меню
	* @param array $node - проверяемая ветка
	* @param int/array $cid - идентификатор страницы
	*
	* @return bool $inPath
	*/
	public static function pathHasNode($menu,$node,$cid=0)
	{
		if(!is_int($node))
		{
			if(!is_array($node) || !isset($node["cid"]))return false;
			$fi=0+$node["cid"];
		}
		else $fi=$node;
		if(!$fi)return false;
		if(!$cid)
		{
			self::pathFind($menu);
			$p=self::$paths[$menu];
		}
		else $p=self::pathFind($menu,$cid);
 		return in_array($fi,$p);
	}
}
?>