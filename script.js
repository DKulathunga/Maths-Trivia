class AdvancedMathTriviaGame {
    constructor() {
        this.currentUser = null;
        this.selectedFruit = 'tomato'; // Default fruit
        this.score = 0;
        this.currentQuestion = null;
        this.questionsAttempted = 0;
        this.correctAnswers = 0;
        this.timer = null;
        this.timeLeft = 30;
        this.gameActive = false;

        this.fruitAPIs = {
            'tomato': 'https://marcconrad.com/uob/tomato/api.php',
            'banana': 'https://marcconrad.com/uob/banana/api.php',
            'apple': 'https://marcconrad.com/uob/banana/api.php',
            'orange': 'https://marcconrad.com/uob/banana/api.php'
        };

        this.fruitThemes = {
            'tomato': { emoji: '🍅', name: 'Tomato', color: '#ff6b6b' },
            'banana': { emoji: '🍌', name: 'Banana', color: '#f9ca24' },
            'apple': { emoji: '🍎', name: 'Apple', color: '#badc58' },
            'orange': { emoji: '🍊', name: 'Orange', color: '#ffbe76' }
        };

        this.initializeEventListeners();
        this.loadUserPreferences();
    }

    initializeEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });

        document.querySelectorAll('.fruit-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectFruit(e.currentTarget.dataset.fruit);
            });
        });

        document.getElementById('nextQuestion').addEventListener('click', () => this.nextQuestion());
        document.getElementById('endGame').addEventListener('click', () => this.endGame());
        document.getElementById('playAgain').addEventListener('click', () => this.playAgain());
        document.getElementById('exitToMainMenu').addEventListener('click', () => this.exitTOMainMenu());
        document.getElementById('changeFruit').addEventListener('click', () => this.showFruitModal());

        document.querySelectorAll('.fruit-option-modal').forEach(option => {
            option.addEventListener('click', (e) => {
                this.changeFruitTheme(e.currentTarget.dataset.fruit);
            });
        });

        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    selectFruit(fruit) {
        document.querySelectorAll('.fruit-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`.fruit-option[data-fruit="${fruit}"]`).classList.add('selected');
        this.selectedFruit = fruit;
    }

    changeFruitTheme(fruit) {
        this.selectedFruit = fruit;
        this.applyFruitTheme();
        this.updateFruitDisplay();
        document.getElementById('fruitModal').style.display = 'none';
        if (this.gameActive) this.loadQuestion();
    }

    applyFruitTheme() {
        document.body.className = document.body.className.replace(/fruit-theme-\w+/g, '');
        document.body.classList.add(`${this.selectedFruit}-theme`);
    }

    updateFruitDisplay() {
        const fruitTheme = this.fruitThemes[this.selectedFruit];
        document.getElementById('fruitEmoji').textContent = fruitTheme.emoji;
        document.getElementById('fruitTitle').textContent = `${fruitTheme.name} Math Challenge`;
        document.getElementById('currentFruit').textContent = `${fruitTheme.emoji} ${fruitTheme.name} Theme`;
        document.getElementById('resultFruitEmoji').textContent = fruitTheme.emoji;
        document.getElementById('statsFruit').textContent = fruitTheme.name;
    }

    startGame() {
        const username = document.getElementById('username').value.trim();
        if (!username) {
            alert('Please enter a username!');
            return;
        }

        this.currentUser = username;
        this.score = 0;
        this.questionsAttempted = 0;
        this.correctAnswers = 0;
        this.gameActive = true;

        this.applyFruitTheme();
        this.showScreen('gameScreen');
        this.updateScore();
        this.updateFruitDisplay();
        this.loadQuestion();
        this.startTimer();
        this.saveUserPreferences();
    }

    async loadQuestion() {
        try {
            const apiUrl = this.fruitAPIs[this.selectedFruit];
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('API not available');

            const data = await response.json();
            this.currentQuestion = data;
            this.displayQuestion(data);
        } catch (error) {
            console.error(`Error loading ${this.selectedFruit} question:`, error);
            await this.loadFallbackQuestion();
        }
    }

    async loadFallbackQuestion() {
        try {
            const response = await fetch(this.fruitAPIs['banana']);
            const data = await response.json();
            this.currentQuestion = data;
            this.displayQuestion(data);
        } catch (error) {
            console.error('Error loading fallback question:', error);
            this.loadLocalQuestion();
        }
    }

    loadLocalQuestion() {
        const localQuestions = {
            'tomato': [
                { question: "https://via.placeholder.com/350x250/ff6b6b/white?text=7+×+6", solution: 42 },
                { question: "https://via.placeholder.com/350x250/ff6b6b/white?text=15+÷+3", solution: 5 }
            ],
            'banana': [
                { question: "https://via.placeholder.com/350x250/f9ca24/white?text=8+×+7", solution: 56 },
                { question: "https://via.placeholder.com/350x250/f9ca24/white?text=24+÷+4", solution: 6 }
            ]
        };
        const questions = localQuestions[this.selectedFruit] || localQuestions['tomato'];
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        this.currentQuestion = randomQuestion;
        this.displayQuestion(randomQuestion);
    }

    displayQuestion(questionData) {
        const questionImage = document.getElementById('questionImage');
        const optionsContainer = document.getElementById('options');
        const nextButton = document.getElementById('nextQuestion');

        questionImage.innerHTML = '';
        optionsContainer.innerHTML = '';
        nextButton.style.display = 'none';

        const img = document.createElement('img');
        img.src = questionData.question;
        img.alt = `${this.fruitThemes[this.selectedFruit].name} Math Problem`;
        img.onerror = () => this.createTextQuestion(questionData.solution);
        questionImage.appendChild(img);

        const correctAnswer = questionData.solution;
        const options = this.generateOptions(correctAnswer);
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.checkAnswer(option, correctAnswer));
            optionsContainer.appendChild(optionElement);
        });

        this.resetTimer();
    }

    createTextQuestion(correctAnswer) {
        const questionImage = document.getElementById('questionImage');
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = correctAnswer / num1;
        questionImage.innerHTML = `<p>What is ${num1} × ${num2}?</p>`;
    }

    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        while (options.length < 4) {
            const variance = Math.floor(Math.random() * 10) + 1;
            const wrong = correctAnswer + (Math.random() > 0.5 ? variance : -variance);
            if (wrong > 0 && !options.includes(wrong)) options.push(wrong);
        }
        return options.sort(() => Math.random() - 0.5);
    }

    checkAnswer(selected, correct) {
        if (!this.gameActive) return;
        this.questionsAttempted++;
        const options = document.querySelectorAll('.option');
        const nextButton = document.getElementById('nextQuestion');
        options.forEach(opt => opt.style.pointerEvents = 'none');

        options.forEach(opt => {
            if (parseInt(opt.textContent) === correct) opt.classList.add('correct');
            if (parseInt(opt.textContent) === parseInt(selected) && selected !== correct) opt.classList.add('incorrect');
        });

        if (parseInt(selected) === correct) {
            this.score += 10;
            this.correctAnswers++;
            this.updateScore();
        }

        nextButton.style.display = 'block';
        this.stopTimer();
    }

    nextQuestion() {
        if (this.gameActive) {
            this.loadQuestion();
            this.updateScore();
        }
    }

    endGame() {
        try {
            this.gameActive = false;
            this.stopTimer();
            this.saveGameData();
            this.showResults();

            // // ✅ delay redirect to show results for 2 seconds
            // setTimeout(() => {
            //     window.location.href = 'index.html'; 
            // }, 20000);
        } catch (e) {
            console.error('Error ending game:', e);
        }
    }

    exitTOMainMenu() {
        window.location.href = 'index.html'; 
    }

    showResults() {
        const accuracy = this.questionsAttempted > 0 ? 
            Math.round((this.correctAnswers / this.questionsAttempted) * 100) : 0;

        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        document.getElementById('questionsAttempted').textContent = `Questions Attempted: ${this.questionsAttempted}`;
        document.getElementById('correctAnswers').textContent = `Correct Answers: ${this.correctAnswers}`;
        document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;

        document.getElementById('userStats').innerHTML = this.getUserStatsHTML();
        this.showScreen('resultsScreen');
    }

    getUserStatsHTML() {
        const userData = this.getUserData();
        const totalGames = userData.gamesPlayed || 0;
        const averageScore = totalGames > 0 ? Math.round(userData.totalScore / totalGames) : 0;
        const totalAccuracy = userData.totalQuestions > 0 ? 
            Math.round((userData.totalCorrect / userData.totalQuestions) * 100) : 0;

        return `
            <div class="stat-item"><span>Total Games:</span><span>${totalGames}</span></div>
            <div class="stat-item"><span>Highest Score:</span><span>${userData.highestScore || 0}</span></div>
            <div class="stat-item"><span>Average Score:</span><span>${averageScore}</span></div>
            <div class="stat-item"><span>Overall Accuracy:</span><span>${totalAccuracy}%</span></div>
        `;
    }

    playAgain() {
        this.score = 0;
        this.questionsAttempted = 0;
        this.correctAnswers = 0;
        this.gameActive = true  ;
        this.showScreen('gameScreen');
        this.updateScore();
        this.loadQuestion();
        this.startTimer();
    }

    startTimer() {
        this.timeLeft = 30;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.timeUp();
                this.nextQuestion();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    resetTimer() {
        this.stopTimer();
        this.startTimer();
    }

    timeUp() {
        this.stopTimer();
        if (this.gameActive) {
            const options = document.querySelectorAll('.option');
            options.forEach(o => o.style.pointerEvents = 'none');
            document.getElementById('nextQuestion').style.display = 'block';
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        timerElement.textContent = this.timeLeft;
        if (this.timeLeft <= 10) {
            timerElement.style.background = '#ff4757';
            timerElement.style.animation = 'pulse 1s infinite';
        } else {
            timerElement.style.background = '#ff6b6b';
            timerElement.style.animation = 'none';
        }
    }

    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('currentUser').textContent = this.currentUser;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    }

    saveGameData() {
        const userData = this.getUserData();
        userData.gamesPlayed = (userData.gamesPlayed || 0) + 1;
        userData.totalScore = (userData.totalScore || 0) + this.score;
        userData.totalQuestions = (userData.totalQuestions || 0) + this.questionsAttempted;
        userData.totalCorrect = (userData.totalCorrect || 0) + this.correctAnswers;
        if (this.score > (userData.highestScore || 0)) userData.highestScore = this.score;

        userData.lastPlayed = new Date().toISOString();
        userData.preferredFruit = this.selectedFruit;
        localStorage.setItem(`user_${this.currentUser}`, JSON.stringify(userData));
    }

    saveUserPreferences() {
        const preferences = {
            username: this.currentUser,
            preferredFruit: this.selectedFruit,
            lastLogin: new Date().toISOString()
        };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    getUserData() {
        const stored = localStorage.getItem(`user_${this.currentUser}`);
        return stored ? JSON.parse(stored) : {};
    }

    loadUserPreferences() {
        const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (prefs.username) {
            this.currentUser = prefs.username;
            this.selectedFruit = prefs.preferredFruit || 'tomato';
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.game = new AdvancedMathTriviaGame();
});
