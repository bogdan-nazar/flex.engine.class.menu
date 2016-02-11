<?
namespace FlexEngine;
defined("FLEX_APP") or die("Forbidden.");
final class menu extends module
{
	private static $config			=	array(
		"maxLookLvls"				=>	10
	);
	private static $class			=	"";
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
		$extchilds=false;
		if(isset($parent["extchilds"]) && $parent["extchilds"])
		{
			//trying to get childs from external module
			$extchilds=@unserialize($parent["extchilds"]);
			if($extchilds===false)
			{
				$parent["extchilds"]=false;
				return;
			}
			if(class_exists(__NAMESPACE__."\\".$extchilds["class"]) && method_exists(__NAMESPACE__."\\".$extchilds["class"],$extchilds["method"]))
				$nodes=call_user_func(array(__NAMESPACE__."\\".$extchilds["class"],$extchilds["method"]),$parent);
		}
		else
		{
			//fetching data from database
			$q="SELECT `me`.`id`,`me`.`vis`,`me`.`cid`,`me`.`ord`,`me`.`target`,`me`.`title` AS `atitle`,`me`.`link`,
			`c`.`alias`,`c`.`title`,`me`.`par1`,`me`.`par2`,`me`.`par3`,`me`.`ext`,`me`.`extchilds`
			FROM ".self::tb(self::$class."_entries")." `me`
			LEFT JOIN ".self::tb("content")." `c` ON `me`.`cid`=`c`.`id`
			WHERE `me`.`mid`=".$menu." AND `me`.`pid`=".$pid." AND `me`.`vis`=1 ORDER BY `me`.`ord`";
			$r=self::q($q,true);
			while($row=self::qf($r))$nodes[]=$row;
		}
		if(!is_array($nodes) || !count($nodes))return;
		self::$uriSimbolic=self::path("simbolic");
		$parent["entries"]=array();
		$cnt=0;
		//checking data and forming nodes from it
		foreach($nodes as $key=>$item)
		{
			$cnt++;
			$ext=false;
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
			//creating new node
			$parent["entries"][]=array();
			$node=&$parent["entries"][count($parent["entries"])-1];
			//filling out it from item
			if(!isset($item["id"]))$node["id"]=0;
			else $node["id"]=0+$item["id"];
			$node["parent"]=&$parent;
			if(!isset($item["vis"]))$node["vis"]=0;
			else $node["vis"]=0+$item["vis"];
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
			if(!isset($item["ord"]))$node["ord"]=0;
			else $node["ord"]=0+$item["ord"];
			if(!isset($item["par1"]))$node["par1"]="";
			else $node["par1"]=$item["par1"];
			if(!isset($item["par2"]))$node["par2"]="";
			else $node["par2"]=$item["par2"];
			if(!isset($item["par3"]))$node["par3"]="";
			else $node["par3"]=$item["par3"];
			if(!isset($item["title"]))$node["title"]="";
			else $node["title"]=$item["title"];
			if(!self::$uriSimbolic)$pathcur="";
			else $pathcur=implode("/",self::$items[$menu]["pathcur"]);
			if(!$node["link"])
			{
				if(self::$uriSimbolic)
					$node["link"]=self::appRoot().(self::config("","uriParseType")==CORE_URI_PARSE_FIRSTSECT?"":($pathcur?($pathcur."/"):"")).$node["alias"];
				else
				{
					//ищем по цепочек родителей валидный cid
					$cid=$node["cid"];
					if(!$cid)
					{
						$i=&$node;
						while(true)
						{
							if(!isset($i["parent"]["cid"]))break;
							else
								if($i["parent"]["cid"]>0)
								{
									$cid=$i["parent"]["cid"];
									break;
								}
								else $i=&$i["parent"];
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
			//заполняем карту узла
			$node["map"]=$node["id"]."-".self::$items[$menu]["lvlcur"]."-".$node["cid"].(self::$uriSimbolic?"-".$node["alias"]:"");
			self::$items[$menu]["map"][$node["map"]]=array("cids"=>array(),"entry"=>&$node);
			$mn=&self::$items[$menu]["map"][$node["map"]]["cids"];
			if($node["cid"])$mn[]=$node["cid"];
			$i=$node;
			while(true)
			{
				if(!isset($i["parent"]["cid"]))break;
				else if($i["parent"]["cid"])array_unshift($mn,$i["parent"]["cid"]);
				$i=$i["parent"];
			}
			self::$items[$menu]["lvlcur"]++;
			$ai=self::config("","siteIndex");
			if($node["alias"]!=$ai)array_push(self::$items[$menu]["pathcur"],$node["alias"]);
			if(!$extchilds && !$ext)self::_entriesLoad($menu,$node);
			//unset($node["parent"]);
			if($node["alias"]!=$ai)array_pop(self::$items[$menu]["pathcur"]);
			self::$items[$menu]["lvlcur"]--;
		}
	}

	/**
	* Инициализация данного модуля
	*
	*/
	protected static function _on1init()
	{
		self::$class=self::_class();
	}

	/**
	* Выполнение, подготовка данных
	*
	*/
	protected static function _on2exec()
	{
		self::$uriSimbolic=self::path("simbolic");
		self::resourceScriptAdd();
		self::resourceStyleAdd();
	}

	protected static function _on3render($section="")
	{
		$args=func_get_args();
		if(isset($args[1]))$menu=$args[1];else $menu=false;
		if(isset($args[2]))$sect=$args[2];else $sect="";
		if(isset($args[3]))$node=$args[3];else $node=0;
		if(!$menu)return;
		/*
		//временный билдер меню
		if($menu==1)
		{
			$ar=serialize(array("class"=>"phpbb","method"=>"menuGen"));
			db::q("UPDATE ".db::tnm(self::$class."_entries")." SET `ext`='".addslashes($ar)."' WHERE `id` IN (5,6)",false);
		}
		$ar=serialize(array("class"=>"blog","method"=>"menuGen"));
		db::q("UPDATE ".db::tnm(self::$class."_entries")." SET `extchilds`='{$extdata}' WHERE `id` in (3, 4, 5, 6)",true);
		*/
		/*
		//загрузка из кэша
		$cache=cache::get(self::$class,"menu".$menu,self::$cacheTTL,false);
		if($cache!==false)
		{
			self::$items[$menu]=@unserialize($cache);
			if(!is_array(self::$items[$menu]))unset(self::$items[$menu]);
		}
		*/
		if((0+$menu)>0)$where=" `id`=".(0+$menu);
		else $where=" `alias`='".self::qe($menu)."'";
		$q="SELECT `id`,`cache`,`lvls`,`showtitle`,`alias`,`title` FROM ".self::tb(self::$class)." WHERE".$where." AND `act`=1";
		$r=self::q($q,true);
		$row=self::qf($r);
		if(!$row)return;
		$alias=$row["alias"];
		if(!$sect)$sect=$alias;
		$t=self::tplGet($sect);
		if($t->error())return;
		$menu=0+$row["id"];
		if(is_string($node) && ((0+$node)===0))
		{
			$q="SELECT `id` FROM ".self::tb(self::$class."_entries")." WHERE `mid`=".$menu." AND `vis`=1 AND `link` LIKE '%/".$node."'";
			$r1=self::q($q,true);
			$row1=@mysql_fetch_assoc($r1);
			if(!$row1)$node=0;
			else $node=0+$row1["id"];
		}
		self::$items[$menu]=array();
		self::$items[$menu]["id"]=$node;
		self::$items[$menu]["cache"]=0+$row["cache"];
		self::$items[$menu]["lvls"]=0+$row["lvls"];
		self::$items[$menu]["showtitle"]=0+$row["showtitle"];
		self::$items[$menu]["alias"]=$alias;
		self::$items[$menu]["title"]=$row["title"];
		self::$items[$menu]["lvlcur"]=0;
		self::$items[$menu]["map"]=array();
		self::$items[$menu]["pathcur"]=array();
		self::$items[$menu]["entries"]=array();
		self::_entriesLoad($menu,self::$items[$menu]);
		$chain=self::pathFindQueryMatch($menu);
		$cnt=count(self::$items[$menu]["entries"]);
		if(self::$items[$menu]["showtitle"])
		{
			$t->setVar("menu-show","show");
			$t->setVar("menu-title",self::$items[$menu]["title"]);
		}
		if(!$cnt)
		{
			$t->setArrayCycle("entries",array());
			$t->_render();
			if(self::$items[$menu]["cache"])self::cacheSet("menu".$menu,self::$cacheTTL,@serialize(self::$items[$menu]));
			return;
		}
		$data=array();
		$cur=0;
		$itemAct=false;
		$itemAct1=false;
		self::$uriSimbolic=self::path("simbolic");
		foreach(self::$items[$menu]["entries"] as $key=>$props)
		{
			if(!$props["vis"])continue;
			$cur++;
			$item=array();
			$item["alias"]=$props["alias"];
			$item["link"]=$props["link"];
			$item["title"]=$props["title"];
			$item["ord"]=$props["ord"];
			$item["par1"]=$props["par1"];
			$item["par2"]=$props["par2"];
			$item["par3"]=$props["par3"];
			if($chain!==false)$act=($props["id"]==$chain[0]);
			elseif(self::pathHasNode($menu,$props))$act=true;
			else $act=(strpos($_SERVER["REQUEST_URI"],$item["link"])===0);
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
						$subitem["child-ord"]=$props1["ord"];
						$subitem["child-par1"]=$props1["par1"];
						$subitem["child-par2"]=$props1["par2"];
						$subitem["child-par3"]=$props1["par3"];
						if($chain!==false)$act1=($props["id"]==$chain[1]);
						elseif(self::pathHasNode($menu,$props1))$act=true;
						else $act1=(strpos($_SERVER["REQUEST_URI"],$subitem["child-link"])===0);
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
		if($itemAct)$t->setVar("section-cur-title",$itemAct);
		$t->setArrayCycle("entries",$data);
		$t->_render();
	}

	/**
	* Завершение и сохранение
	*
	*/
	protected static function _on4sleep()
	{
	}

	/**
	* Функция находит текущий путь [последовательность cid]
	* для указанного контента или текущего контента;
	* 	для текущего контента путь сохраняется в self::$path
	* 	для указанного контента путь возвращается как результат
	*
	* @param int $menu - идентификатор меню
	* @param array $cont - id и alias контента
	*/
	public static function pathFind($menu,$cont=false)
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
			$cid=self::page("id");
			if(self::$uriSimbolic)$alias="-".self::page("alias");
		}
		else
		{
			if(!is_array($cont) || !isset($cont["id"]) || (self::$uriSimbolic && !isset($cont["alias"])))return array();
			$cid=$cont["id"];
			if(self::$uriSimbolic)$alias="-".$cont["alias"];
		}
		$fp=false;
		foreach(self::$items[$menu]["map"] as $key=>$path)
		{
			if(strpos($key,"-".$cid.$alias)!==false)
			{
				$fp=self::$items[$menu]["map"][$key]["cids"];
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
	* Проверка совпадения цепочки страниц контента
	* с текущей веткой структуры меню.
	* Цепочка страниц, состоящая менее чем из 2-х cid,
	* отличных от 1 (главной), игнорируется.
	* Функция должна вызываться после _entriesLoad.
	*
	* @param int $menu - идентификатор меню
	*
	* @return bool/array $nodemap
	*/
	public static function pathFindQueryMatch($menu)
	{
		$path=content::path();
		$cids=array();
		foreach($path as $key=>$cont)if($cont["id"]!=1)$cids[]=$cont;
		$len=count($cids);
		if(!$len || ($len<2))return false;
		$nodes=array();
		$parents=array();
		$lvl=$len-1;
		for($l=$lvl;$l>-1;$l--)
		{
			$cont=$cids[$l];
			$mapkey="-".$l."-".$cont["id"]."-".$cont["alias"];
			foreach(self::$items[$menu]["map"] as $key=>$val)
			{
				if(strpos($key,$mapkey))
				{
					$node=self::$items[$menu]["map"][$key]["entry"];
					$nid=$node["id"];
					$pid=isset($node["parent"]["cid"])?$node["parent"]["id"]:0;
					$add=false;
					if($l==$lvl)$add=true;
					else
					{
						if(isset($parents[$l+1]) && in_array($nid,$parents[$l+1]))$add=true;
					}
					if($add)
					{
						if(!isset($nodes[$l]))$nodes[$l]=array();
						$nodes[$l][]=$nid;
						if(!isset($parents[$l]))$parents[$l]=array();
						$parents[$l][]=$pid;
					}
				}
			}
		}
		$res=array();
		if(isset($nodes[$lvl]) && is_array($nodes[$lvl]) && count($nodes[$lvl]))
		for($l=0;$l<=$lvl;$l++)
		{
			if(!isset($nodes[$l]))
			{
				$res=array();
				break;
			}
			$res[]=$nodes[$l][0];
		}
		if(!count($res))return false;
		else return $res;
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
			if(!isset(self::$paths[$menu]))self::pathFind($menu);
			$p=self::$paths[$menu];
		}
		else $p=self::pathFind($menu,$cid);
 		return in_array($fi,$p);
	}
}
?>