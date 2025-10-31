class GameEngine {
    constructor(authManager, api, uiManager) {
        this.authManager = authManager;
        this.api = api;
        this.uiManager = uiManager;
        this.currentGame = null;
        this.timer = null;
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        document.getElementById('question-count').addEventListener('input', (e) => {
            document.getElementById('count-display').textContent = `${e.target.value} questions`;
        });

        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('play-again-btn').addEventListener('click', () => this.playAgain());
        document.getElementById('new-settings-btn').addEventListener('click', () => this.showSetup());
    }

    async startGame() {
        this.authManager.savePreferencesFromUI();
        const preferences = this.getGamePreferences();
        
        try {
            this.uiManager.showLoadingState();
            
            document.getElementById('setup-section').classList.remove('active');
            document.getElementById('game-section').classList.add('active');
            
            // Initialize game state
            this.currentGame = {
                preferences: preferences,
                questions: [],
                currentQuestionIndex: 0,
                score: 0,
                correctAnswers: 0,
                startTime: Date.now(),
                selectedAnswers: new Map(),
                apiUsage: { tomato: 0, banana: 0, fallback: 0 }
            };

            // Fetch questions from API
            const result = await this.api.getQuestions(preferences);
            this.currentGame.questions = result.questions;
            this.currentGame.apiUsage = result.apiUsage;
            
            if (this.currentGame.questions.length === 0) {
                throw new Error('No questions available from any source');
            }

            this.displayQuestion();
            this.startTimer();

        } catch (error) {
            console.error('Game start error:', error);
            this.uiManager.displayError('Failed to start game. Please try again.');
            this.showSetup();
        } finally {
            this.uiManager.hideLoadingState();
        }
    }

    getGamePreferences() {
        return {
            gameMode: document.getElementById('game-mode').value,
            apiSource: document.getElementById('api-source').value,
            difficulty: document.getElementById('difficulty').value,
            questionCount: parseInt(document.getElementById('question-count').value)
        };
    }

    displayQuestion() {
        if (!this.currentGame || !this.currentGame.questions.length) return;

        const currentQ = this.currentGame.questions[this.currentGame.currentQuestionIndex];
        
        // Update UI elements
        document.getElementById('current-q').textContent = this.currentGame.currentQuestionIndex + 1;
        document.getElementById('total-qs').textContent = this.currentGame.questions.length;
        document.getElementById('current-player').textContent = this.authManager.getCurrentUser().username;
        document.getElementById('current-score').textContent = this.currentGame.score;

        // Update API source display
        this.uiManager.updateAPISourceDisplay(currentQ.source);

        // Display question based on type
        if (currentQ.type === 'visual') {
            this.uiManager.showVisualQuestion(currentQ.question);
        } else {
            this.uiManager.showTextQuestion(currentQ.question);
        }

        // Create options
        this.displayOptions(currentQ);
        document.getElementById('next-btn').disabled = true;
    }

    displayOptions(question) {
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        const allOptions = this.shuffleArray([
            question.correctAnswer,
            ...question.incorrectAnswers
        ]);

        allOptions.forEach((option) => {
            const button = document.createElement('button');
            button.className = `option-btn ${question.type === 'visual' ? 'visual-option' : ''}`;
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(option, button, question));
            optionsContainer.appendChild(button);
        });
    }

    selectAnswer(selectedAnswer, buttonElement, question) {
        if (this.currentGame.selectedAnswers.has(this.currentGame.currentQuestionIndex)) {
            return;
        }

        const isCorrect = selectedAnswer === question.correctAnswer;

        // Disable all options
        const allButtons = document.querySelectorAll('.option-btn');
        allButtons.forEach(btn => {
            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none';
        });

        // Highlight correct/incorrect
        allButtons.forEach(btn => {
            if (btn.textContent === question.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Update game state
        this.currentGame.selectedAnswers.set(this.currentGame.currentQuestionIndex, {
            selected: selectedAnswer,
            correct: isCorrect,
            source: question.source
        });

        if (isCorrect) {
            this.currentGame.score += this.calculatePoints(question.difficulty);
            this.currentGame.correctAnswers++;
            document.getElementById('current-score').textContent = this.currentGame.score;
        }

        document.getElementById('next-btn').disabled = false;
    }

    calculatePoints(difficulty) {
        const basePoints = 100;
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 1.5,
            'hard': 2
        };
        
        const multiplier = difficultyMultiplier[difficulty] || 1;
        return Math.floor(basePoints * multiplier);
    }

    nextQuestion() {
        this.currentGame.currentQuestionIndex++;

        if (this.currentGame.currentQuestionIndex < this.currentGame.questions.length) {
            this.displayQuestion();
        } else {
            this.endGame();
        }
    }

    startTimer() {
        const timerElement = document.getElementById('timer');
        let timeLeft = 60;

        this.timer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `${timeLeft}s`;

            if (timeLeft <= 10) {
                timerElement.style.color = '#e53e3e';
            }

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.authManager.updateUserStats(
            this.currentGame.score,
            this.currentGame.correctAnswers,
            this.currentGame.questions.length
        );

        this.showResults();
    }

    showResults() {
        document.getElementById('game-section').classList.remove('active');
        document.getElementById('results-section').classList.add('active');

        const accuracy = this.currentGame.questions.length > 0 
            ? Math.round((this.currentGame.correctAnswers / this.currentGame.questions.length) * 100)
            : 0;

        document.getElementById('final-score').textContent = this.currentGame.score;
        document.getElementById('correct-answers').textContent = this.currentGame.correctAnswers;
        document.getElementById('total-questions').textContent = this.currentGame.questions.length;
        document.getElementById('accuracy').textContent = `${accuracy}%`;

        // Show API usage statistics
        this.uiManager.updateAPIStats(this.currentGame.apiUsage);
    }

    quitGame() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
            this.showSetup();
        }
    }

    playAgain() {
        this.authManager.savePreferencesFromUI();
        this.startGame();
    }

    showSetup() {
        document.getElementById('game-section').classList.remove('active');
        document.getElementById('results-section').classList.remove('active');
        document.getElementById('setup-section').classList.add('active');
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}