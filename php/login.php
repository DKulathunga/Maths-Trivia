<?php
session_start();
require 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Debug logging - helps trace login issues (written to php/post_debug.log)
    $debug = date('Y-m-d H:i:s') . " - LOGIN_ATTEMPT\n";
    $debug .= "POST_USERNAME=" . substr($username,0,100) . "\n";
    $debug .= "REMOTE_ADDR=" . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";
    file_put_contents(__DIR__ . '/post_debug.log', $debug, FILE_APPEND);

    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if($stmt->num_rows > 0){
        $stmt->bind_result($user_id, $hashed_password);
        $stmt->fetch();
        file_put_contents(__DIR__ . '/post_debug.log', date('Y-m-d H:i:s') . " - USER_FOUND id={$user_id}\n", FILE_APPEND);
        if(password_verify($password, $hashed_password)){
            $_SESSION['username'] = $username;
            $_SESSION['user_id'] = $user_id;
            file_put_contents(__DIR__ . '/post_debug.log', date('Y-m-d H:i:s') . " - PASSWORD_OK session_id=".session_id()."\n", FILE_APPEND);
            header("Location: ../index.php");
            exit();
        } else {
            file_put_contents(__DIR__ . '/post_debug.log', date('Y-m-d H:i:s') . " - PASSWORD_MISMATCH\n", FILE_APPEND);
            $error = "Invalid password!";
        }
    } else {
        file_put_contents(__DIR__ . '/post_debug.log', date('Y-m-d H:i:s') . " - USER_NOT_FOUND ({$username})\n", FILE_APPEND);
        $error = "User not found!";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Login | Fruit Math Trivia</title>
<link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="login-page">
    <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="post" class="login-form">
        <h1>🍎 Fruit Math Trivia</h1>
        <?php if(isset($error)) echo '<p class="error">' . htmlspecialchars($error) . '</p>'; ?>
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>
</div>
</body>
</html>
