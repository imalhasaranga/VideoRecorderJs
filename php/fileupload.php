<?php


move_uploaded_file($_FILES["video_data"]["tmp_name"],"video/Testaudio.webm");
move_uploaded_file($_FILES["audio_data"]["tmp_name"],"video/Testaudio.mp3");

echo "Done : ";

?>
