class UIManager {
    constructor() {
        this.apiStatus = {
            tomato: 'checking',
            banana: 'checking'
        };
    }

    updateAPIStatus(apiName, status) {
        this.apiStatus[apiName] = status;
        const element = document.getElementById(`${apiName}-status`);
        if (element) {
            element.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            element.className = `status ${status}`;
        }
    }

    showVisualQuestion(imageBase64) {
        const visualContainer = document.getElementById('visual-question');
        const textContainer = document.getElementById('text-question');
        const questionImage = document.getElementById('question-image');

        // Show visual container, hide text container
        visualContainer.style.display = 'block';
        textContainer.style.display = 'none';

        // Set the image source
        questionImage.src = `data:image/png;base64,${imageBase64}`;
    }

    showTextQuestion(questionText) {
        const visualContainer = document.getElementById('visual-question');
        const textContainer = document.getElementById('text-question');
        const questionElement = document.getElementById('question-text');

        // Show text container, hide visual container
        visualContainer.style.display = 'none';
        textContainer.style.display = 'block';

        // Set the question text
        questionElement.textContent = questionText;
    }

    updateAPISourceDisplay(apiName) {
        const sourceElement = document.getElementById('current-api');
        const displayNames = {
            'tomato': '🍅 Tomato API',
            'banana': '🍌 Banana API',
            'fallback': '📚 Built-in'
        };
        sourceElement.textContent = displayNames[apiName] || apiName;
    }

    updateAPIStats(stats) {
        document.getElementById('tomato-questions').textContent = stats.tomato || 0;
        document.getElementById('banana-questions').textContent = stats.banana || 0;
        document.getElementById('fallback-questions').textContent = stats.fallback || 0;
    }

    showLoadingState() {
        document.getElementById('start-game-btn').classList.add('loading');
        document.getElementById('start-game-btn').disabled = true;
    }

    hideLoadingState() {
        document.getElementById('start-game-btn').classList.remove('loading');
        document.getElementById('start-game-btn').disabled = false;
    }

    displayError(message) {
        // Simple error display - you can enhance this with a proper modal
        console.error('UI Error:', message);
        alert(`Error: ${message}`);
    }
}