class QuizAPI {
    constructor() {
        this.tomatoURL = 'https://marcconrad.com/uob/tomato/api.php';
        this.bananaURL = 'https://marcconrad.com/uob/banana/api.php';
        this.fallbackQuestions = this.generateFallbackQuestions();
        this.apiStatus = {
            tomato: 'checking',
            banana: 'checking'
        };
    }

    async initialize(uiManager) {
        this.uiManager = uiManager;
        await this.testAllAPIs();
    }

    async testAllAPIs() {
        // Test Tomato API
        try {
            const tomatoTest = await fetch(this.tomatoURL);
            if (tomatoTest.ok) {
                this.apiStatus.tomato = 'online';
                this.uiManager.updateAPIStatus('tomato', 'online');
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            this.apiStatus.tomato = 'offline';
            this.uiManager.updateAPIStatus('tomato', 'offline');
        }

        // Test Banana API
        try {
            const bananaTest = await fetch(this.bananaURL);
            if (bananaTest.ok) {
                this.apiStatus.banana = 'online';
                this.uiManager.updateAPIStatus('banana', 'online');
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            this.apiStatus.banana = 'offline';
            this.uiManager.updateAPIStatus('banana', 'offline');
        }
    }

    async getQuestions(preferences) {
        const apiSource = preferences.apiSource;
        const questionCount = preferences.questionCount;
        
        let questions = [];
        let apiUsage = { tomato: 0, banana: 0, fallback: 0 };

        try {
            switch (apiSource) {
                case 'tomato':
                    questions = await this.getTomatoQuestions(questionCount);
                    apiUsage.tomato = questions.length;
                    break;
                    
                case 'banana':
                    questions = await this.getBananaQuestions(questionCount);
                    apiUsage.banana = questions.length;
                    break;
                    
                case 'both':
                    questions = await this.getMixedQuestions(questionCount);
                    apiUsage.tomato = questions.filter(q => q.source === 'tomato').length;
                    apiUsage.banana = questions.filter(q => q.source === 'banana').length;
                    break;
                    
                case 'fallback':
                    questions = this.getFallbackQuestions(preferences);
                    apiUsage.fallback = questions.length;
                    break;
            }

            // If we didn't get enough questions, fill with fallback
            if (questions.length < questionCount) {
                const needed = questionCount - questions.length;
                const fallbackQuestions = this.getFallbackQuestions(preferences).slice(0, needed);
                questions.push(...fallbackQuestions);
                apiUsage.fallback += fallbackQuestions.length;
            }

            return { questions, apiUsage };

        } catch (error) {
            console.error('Error fetching questions:', error);
            // Return fallback questions if all else fails
            const fallbackQuestions = this.getFallbackQuestions(preferences).slice(0, questionCount);
            apiUsage.fallback = fallbackQuestions.length;
            return { questions: fallbackQuestions, apiUsage };
        }
    }

    async getTomatoQuestions(count) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            try {
                if (this.apiStatus.tomato === 'offline') break;
                
                const response = await fetch(this.tomatoURL);
                if (!response.ok) throw new Error('Tomato API failed');
                
                const data = await response.json();
                const question = this.transformTomatoResponse(data, i);
                questions.push(question);
                
                // Add small delay to avoid rate limiting
                await this.delay(100);
            } catch (error) {
                console.warn('Failed to fetch Tomato question:', error);
                break;
            }
        }
        
        return questions;
    }

    async getBananaQuestions(count) {
        const questions = [];
        
        for (let i = 0; i < count; i++) {
            try {
                if (this.apiStatus.banana === 'offline') break;
                
                const response = await fetch(this.bananaURL);
                if (!response.ok) throw new Error('Banana API failed');
                
                const data = await response.json();
                const question = this.transformBananaResponse(data, i);
                questions.push(question);
                
                // Add small delay to avoid rate limiting
                await this.delay(100);
            } catch (error) {
                console.warn('Failed to fetch Banana question:', error);
                break;
            }
        }
        
        return questions;
    }

    async getMixedQuestions(count) {
        const questions = [];
        const halfCount = Math.ceil(count / 2);
        
        // Get questions from both APIs
        const [tomatoQuestions, bananaQuestions] = await Promise.all([
            this.getTomatoQuestions(halfCount),
            this.getBananaQuestions(count - halfCount)
        ]);
        
        // Combine and shuffle
        questions.push(...tomatoQuestions, ...bananaQuestions);
        return this.shuffleArray(questions);
    }

    transformTomatoResponse(tomatoData, index) {
        return {
            id: `tomato-${index}-${Date.now()}`,
            question: `Solve this math problem: ${tomatoData.question}`,
            correctAnswer: tomatoData.solution.toString(),
            incorrectAnswers: this.generateMathOptions(tomatoData.solution),
            category: 'math',
            difficulty: 'medium',
            type: 'multiple',
            source: 'tomato'
        };
    }

    transformBananaResponse(bananaData, index) {
        return {
            id: `banana-${index}-${Date.now()}`,
            question: bananaData.question, // This is the base64 image
            correctAnswer: bananaData.solution.toString(),
            incorrectAnswers: this.generateMathOptions(bananaData.solution),
            category: 'visual-math',
            difficulty: 'medium',
            type: 'visual',
            source: 'banana'
        };
    }

    generateMathOptions(correctAnswer) {
        const correct = parseInt(correctAnswer);
        const options = new Set([correct]);
        
        while (options.size < 4) {
            const variation = Math.floor(Math.random() * 20) - 10; // -10 to +10
            const option = correct + variation;
            if (option !== correct && option > 0) { // Ensure positive numbers for visual puzzles
                options.add(option);
            }
        }
        
        const optionsArray = Array.from(options);
        return this.shuffleArray(optionsArray.slice(0, 3)).map(num => num.toString());
    }

    getFallbackQuestions(preferences) {
        let filtered = this.fallbackQuestions.filter(q => 
            q.difficulty === preferences.difficulty
        );
        
        if (filtered.length < preferences.questionCount) {
            filtered = this.fallbackQuestions;
        }
        
        return this.shuffleArray(filtered).slice(0, preferences.questionCount);
    }

    generateFallbackQuestions() {
        return [
            {
                id: '1',
                question: 'What is the capital of France?',
                correctAnswer: 'Paris',
                incorrectAnswers: ['London', 'Berlin', 'Madrid'],
                category: 'geography',
                difficulty: 'easy',
                type: 'multiple',
                source: 'fallback'
            },
            {
                id: '2',
                question: 'Which planet is known as the Red Planet?',
                correctAnswer: 'Mars',
                incorrectAnswers: ['Venus', 'Jupiter', 'Saturn'],
                category: 'science',
                difficulty: 'easy',
                type: 'multiple',
                source: 'fallback'
            },
            {
                id: '3',
                question: 'What is 8 × 7?',
                correctAnswer: '56',
                incorrectAnswers: ['54', '64', '49'],
                category: 'math',
                difficulty: 'easy',
                type: 'multiple',
                source: 'fallback'
            },
            {
                id: '4',
                question: 'What is 15 + 27?',
                correctAnswer: '42',
                incorrectAnswers: ['38', '45', '52'],
                category: 'math',
                difficulty: 'medium',
                type: 'multiple',
                source: 'fallback'
            },
            {
                id: '5',
                question: 'What is 100 ÷ 4?',
                correctAnswer: '25',
                incorrectAnswers: ['20', '30', '40'],
                category: 'math',
                difficulty: 'medium',
                type: 'multiple',
                source: 'fallback'
            }
        ];
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getAPIStatus() {
        return this.apiStatus;
    }
}