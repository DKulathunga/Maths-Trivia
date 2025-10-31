# Quiz Master: Multiplayer Trivia Challenge

A web-based trivia platform that combines the Tomato API's math puzzles with an engaging quiz game interface.

## Features

- 🎯 **Multiple Game Modes**: Timed Challenge, Survival Mode, Practice Mode
- 📚 **Various Categories**: General Knowledge, Science, History, Geography, Entertainment
- 🎮 **Customizable Difficulty**: Easy, Medium, Hard
- 👤 **User Profiles**: Persistent scores and game history
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🔄 **Fallback System**: Uses generated questions if API is unavailable

## API Integration

### Tomato API
The game integrates with the Tomato API (`https://marcconrad.com/uob/tomato/api.php`) for math-based questions. The API provides:
- Math problems with solutions
- Simple JSON response format
- No authentication required

### Testing API Connectivity
```javascript
// Test API connectivity
await quizMasterApp.api.testAPI();