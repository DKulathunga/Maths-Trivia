<?php
session_start();
if(!isset($_SESSION['username'])){
    echo json_encode(['status'=>'error','message'=>'Not logged in']);
    exit();
}
require 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$score = intval($data['score']);
$questions_attempted = intval($data['questions_attempted']);
$correct_answers = intval($data['correct_answers']);
$fruit = $conn->real_escape_string($data['fruit']);
$accuracy = $questions_attempted > 0 ? ($correct_answers/$questions_attempted)*100 : 0;

$user_id = $_SESSION['user_id'];

$stmt = $conn->prepare("INSERT INTO scores (user_id, fruit, score, questions_attempted, correct_answers, accuracy) VALUES (?,?,?,?,?,?)");
$stmt->bind_param("isiiii",$user_id,$fruit,$score,$questions_attempted,$correct_answers,$accuracy);
$stmt->execute();
$stmt->close();
$conn->close();

echo json_encode(['status'=>'success']);
?>
