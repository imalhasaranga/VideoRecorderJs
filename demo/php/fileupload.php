<?php


$target_path = "uploads/";


$tmp_name = $_FILES['fileToUpload']['tmp_name'];
$size = $_FILES['fileToUpload']['size'];
$name = $_FILES['fileToUpload']['name'];
$name2 = $_GET['filename'];

$target_file = $target_path.$name;


$complete =$target_path.$name2;
$com = fopen($complete, "ab");
error_log($target_path);

    $in = fopen($tmp_name, "rb");
    if ( $in ) {
        while ( $buff = fread( $in, 1048576 ) ) {
            fwrite($com, $buff);
        }   
    }
    fclose($in);

fclose($com);

?>