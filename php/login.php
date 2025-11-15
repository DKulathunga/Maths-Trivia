<?php
session_start();
require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if($stmt->num_rows > 0){
        $stmt->bind_result($user_id, $hashed_password);
        $stmt->fetch();
        if(password_verify($password, $hashed_password)){
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $user_id;
            header("Location: ../index.php");
            exit();
        } else {
            $error = "Invalid password!";
        }
    } else {
        $error = "User not found!";
    }
}
?>
<!-- <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login | Fruit Math Trivia</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="login-page">
    <form action="" method="post" class="login-form">
        <h1>🍎 Fruit Math Trivia</h1>
        <?php if(isset($error)) echo "<p class='error'>$error</p>"; ?>
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
</div>
</body>
</html> -->
