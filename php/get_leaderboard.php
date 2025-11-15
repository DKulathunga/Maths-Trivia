<?php
require 'db_connect.php';
$query = "
    SELECT u.username, s.fruit, s.score, s.accuracy, s.played_at
    FROM scores s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.score DESC
    LIMIT 10
";
$result = $conn->query($query);
$leaderboard = [];
while($row = $result->fetch_assoc()){
    $leaderboard[] = $row;
}
echo json_encode($leaderboard);
$conn->close();
?>
