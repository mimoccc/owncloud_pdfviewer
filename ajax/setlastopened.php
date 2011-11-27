<?php
require_once('../../../lib/base.php');

OC_JSON::checkLoggedIn();

$a = json_decode(OC_Preferences::getValue(OC_User::getUser(),"pdfviewer","lastopened","[]"));

$v = isset($_GET['f']) ? $_GET['f'] : false;
$z = isset($_GET['d']) ? $_GET['d'] : '';

if ($v) { $a = array_merge(array(array($z,$v)),$a); }

function uniq($arr) {  
    $new = array();  
    $hashes = array();  
    foreach($arr as $k => $i) {  
        $hash = md5(serialize($i));  
        if (!isset($hashes[$hash])) {  
            $hashes[$hash] = $hash;   
            $new[] = $i; 
        }  
    }  
    return $new;  
}  

OC_Preferences::setValue(OC_User::getUser(),"pdfviewer","lastopened",json_encode(uniq($a)));

?>