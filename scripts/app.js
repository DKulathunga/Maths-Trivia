class QuizMasterApp {
    constructor() {
        this.authManager = new AuthManager();
        this.uiManager = new UIManager();
        this.api = new QuizAPI();
        this.gameEngine = null;
        this.init();
    }

    async init() {
        // Initialize API status checking
        await this.api.initialize(this.uiManager);
        
        // Initialize game engine after APIs are checked
        this.gameEngine = new GameEngine(this.authManager, this.api, this.uiManager);
        
        console.log('🎯 Quiz Master App Initialized with Dual APIs');
        console.log('API Status:', this.api.getAPIStatus());
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quizMasterApp = new QuizMasterApp();
});