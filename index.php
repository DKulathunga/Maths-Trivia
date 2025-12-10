<?php
session_start();
if (!isset($_SESSION['username'])) {
    header("Location: login.html");
    exit();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fruit Math Trivia Challenge</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <script>
        // expose server session username to client-side
        window.SESSION_USERNAME = <?php echo json_encode($_SESSION['username'] ?? null); ?>;
    </script>
    <!-- <h1>Welcome, <?php echo htmlspecialchars($_SESSION['username']); ?>!</h1> -->
    <div class="container">
       
    <form action="php/logout.php" method="post" style="text-align: right; margin: 10px;">
        <button type="submit" class="quit">
            Quit Game
        </button>
    </form>

        <!-- Login Screen -->
        <div id="loginScreen" class="screen active">
            <div class="login-form">
                <h1>🍎 Fruit Math Trivia</h1>
                <?php if (isset($_SESSION['username']) && $_SESSION['username']): ?>
                    <div class="logged-user"><strong>Welcome <?php echo htmlspecialchars($_SESSION['username']); ?> !</strong></div>
                <?php else: ?>
                    <input type="text" id="username" placeholder="Enter your username" maxlength="20">
                <?php endif; ?>
                
                <div class="fruit-selection">
                    <h3>Choose Your Favorite Fruit Theme</h3>
                    <div class="fruits-grid">
                        <div class="fruit-option" data-fruit="tomato">
                            <span>🍅</span>
                            <span>Tomato</span>
                        </div>
                        <div class="fruit-option" data-fruit="banana">
                            <span>🍌</span>
                            <span>Banana</span>
                        </div>
                        <div class="fruit-option" data-fruit="apple">
                            <span>🍎</span>
                            <span>Apple</span>
                        </div>
                        <div class="fruit-option" data-fruit="orange">
                            <span>🍊</span>
                            <span>Orange</span>
                        </div>
                    </div>
                </div>
                
                <button id="startGame">Start Game</button>
            </div>
        </div>

        <!-- Game Screen (single card layout) -->
        <div id="gameScreen" class="screen">
            <div class="single-card">
                <div class="card-header">
                    <div class="header-left">
                        <div class="player-info">
                            <div class="player-name"><span class="player-label">Player Name :</span> <span id="currentUser">User</span></div>
                            
                            <div class="player-score"> <span id="score">0</span></div>
                            <div class="player-theme"><span class="theme-label">Theme:</span> <span id="currentFruit">Tomato Theme</span></div>
                        </div>
                    </div>

                    <div class="header-center">
                        <div class="fruit-header">
                            <span id="fruitEmoji">🍅</span>
                            <h3 id="fruitTitle">Tomato Math Challenge</h3>
                        </div>
                        <div class="progress" id="progressBar" aria-hidden="true">
                            <div class="progress-fill" style="width:0%"></div>
                        </div>
                    </div>

                    <div class="header-right">
                        <div class="timer" id="timer">30</div>
                        <button id="changeFruit" class="change-fruit-btn small">Change Fr
                            uit</button>
                        <button id="endGame" class="danger small">End Game</button>
                    </div>
                </div>

                <div class="question-card">
                    <div id="questionImage" class="question-image"></div>
                </div>

                <div class="options" id="options"></div>

                <div class="card-actions">
                    <button id="nextQuestion" style="display:none;" class="primary small">Next Question</button>
                </div>

            </div>
        </div>

        <!-- Results Screen -->
        <div id="resultsScreen" class="screen">
            <div class="results">
                <div class="fruit-result-header">
                    <span id="resultFruitEmoji">🍅</span>
                    <h2>Game Results</h2>
                </div>
                <div id="finalScore">Score: 0</div>
                <div id="questionsAttempted">Questions: 0</div>
                <div id="correctAnswers">Correct: 0</div>
                <div class="accuracy" id="accuracy">Accuracy: 0%</div>
                
                <div class="leaderboard">
                    <h3>Your Progress with <span id="statsFruit">Tomato</span></h3>
                    <div id="userStats"></div>
                </div>
                
                <div class="result-actions">
                    <button id="playAgain">Play Again</button>
                    <button id="exitToMainMenu">Exit to Main Menu</button>
                </div>
            </div>
        </div>

        <!-- Fruit Selection Modal -->
        <div id="fruitModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h3>Choose Your Fruit Theme</h3>
                <div class="fruits-grid-modal">
                    <div class="fruit-option-modal" data-fruit="tomato">
                        <span class="fruit-emoji">🍅</span>
                        <span class="fruit-name">Tomato</span>
                        <span class="fruit-desc">Red & Juicy Math</span>
                    </div>
                    <div class="fruit-option-modal" data-fruit="banana">
                        <span class="fruit-emoji">🍌</span>
                        <span class="fruit-name">Banana</span>
                        <span class="fruit-desc">Yellow & Curvy Puzzles</span>
                    </div>
                    <div class="fruit-option-modal" data-fruit="apple">
                        <span class="fruit-emoji">🍎</span>
                        <span class="fruit-name">Apple</span>
                        <span class="fruit-desc">Crispy & Fresh Problems</span>
                    </div>
                    <div class="fruit-option-modal" data-fruit="orange">
                        <span class="fruit-emoji">🍊</span>
                        <span class="fruit-name">Orange</span>
                        <span class="fruit-desc">Citrus Math Fun</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="js/game.js"></script>
</body>
</html>