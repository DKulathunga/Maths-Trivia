class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('username').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            alert('Please enter a username to continue!');
            return;
        }

        if (username.length < 3) {
            alert('Username must be at least 3 characters long!');
            return;
        }

        this.currentUser = {
            username: username,
            id: this.generateUserId(),
            joinDate: new Date().toISOString(),
            gamesPlayed: 0,
            totalScore: 0,
            preferences: this.getDefaultPreferences()
        };

        this.saveUserToStorage();
        this.showSetupSection();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    getDefaultPreferences() {
        return {
            gameMode: 'timed',
            category: 'general',
            difficulty: 'medium',
            questionCount: 10
        };
    }

    saveUserToStorage() {
        localStorage.setItem('quizMasterUser', JSON.stringify(this.currentUser));
    }

    loadUserFromStorage() {
        const savedUser = localStorage.getItem('quizMasterUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            document.getElementById('username').value = this.currentUser.username;
        }
    }

    updateUserStats(score, correctAnswers, totalQuestions) {
        if (!this.currentUser) return;

        this.currentUser.gamesPlayed += 1;
        this.currentUser.totalScore += score;
        
        // Update best score if applicable
        if (!this.currentUser.bestScore || score > this.currentUser.bestScore) {
            this.currentUser.bestScore = score;
        }

        this.saveUserToStorage();
    }

    showSetupSection() {
        document.getElementById('auth-section').classList.remove('active');
        document.getElementById('setup-section').classList.add('active');
        
        // Load user preferences
        if (this.currentUser.preferences) {
            this.loadPreferencesToUI();
        }
    }

    loadPreferencesToUI() {
        const prefs = this.currentUser.preferences;
        document.getElementById('game-mode').value = prefs.gameMode;
        document.getElementById('category').value = prefs.category;
        document.getElementById('difficulty').value = prefs.difficulty;
        document.getElementById('question-count').value = prefs.questionCount;
        document.getElementById('count-display').textContent = `${prefs.questionCount} questions`;
    }

    savePreferencesFromUI() {
        if (!this.currentUser) return;

        this.currentUser.preferences = {
            gameMode: document.getElementById('game-mode').value,
            category: document.getElementById('category').value,
            difficulty: document.getElementById('difficulty').value,
            questionCount: parseInt(document.getElementById('question-count').value)
        };

        this.saveUserToStorage();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('quizMasterUser');
        document.getElementById('auth-section').classList.add('active');
        document.getElementById('setup-section').classList.remove('active');
        document.getElementById('game-section').classList.remove('active');
        document.getElementById('results-section').classList.remove('active');
    }

    getCurrentUser() {
        return this.currentUser;
    }
}