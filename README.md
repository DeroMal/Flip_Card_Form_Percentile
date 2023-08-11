# City-Country Match Game

Welcome to the City-Country Match Game repository! This interactive game challenges players to match cities to the countries they belong to. Dive in to test your geographical knowledge and see how you rank!

## 🌍 Overview

The game presents players with a series of cards, each representing a city. The player's task is to match each city with its corresponding country. Upon completion, the player's time is recorded, and they're given a percentile rank based on their performance compared to other players. Additionally, players have the option to submit their details for further engagement.

## 📖 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [File Structure](#file-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Interactive Gameplay**: Engage with a user-friendly interface and smooth animations.
- **Performance Tracking**: Get real-time feedback on your game performance.
- **Backend Integration**: Seamless integration with Google Apps Script and Cloudflare Workers for data storage and retrieval.

## 🚀 Getting Started

### Prerequisites

- A Google account to set up Google Apps Script.
- A Cloudflare account to deploy the worker function.

### Setup

1. **Google Apps Script**:
   - Navigate to [Google Apps Script](https://script.google.com/).
   - Create a new script and replace its content with the provided script from the `Google Apps Script` folder.
   - Publish the script as a web app. Note down the provided URL.
   - Replace the dummy URL in the Cloudflare Worker script with the URL you obtained from publishing the Google Apps Script.

2. **Cloudflare Worker**:
   - Navigate to [Cloudflare Workers](https://workers.cloudflare.com/).
   - Create a new worker and replace its content with the provided script from the `Cloudflare Worker` folder.
   - Deploy the worker and note down the provided URL.
   - Replace the dummy URL in the `script.html` file with the URL you obtained from deploying the Cloudflare Worker.

3. **Game Setup**:
   - Clone this repository or download the files.
   - Open `index.html` in a browser to play the game.

## 📁 File Structure

- `index.html`: The main HTML file containing the structure of the game.
- `styles.css`: Contains the styling for the game.
- `script.js`: Contains the JavaScript logic for the game.
- `Google Apps Script`: Folder containing the backend script to save game data to a Google Sheet.
- `Cloudflare Worker`: Folder containing the worker function to handle CORS issues when communicating with Google Apps Script.

## 🎮 Usage

To play the game, simply open `index.html` in a browser. Match each city card with its corresponding country. Once all matches are made, your time will be recorded and you'll be given a percentile rank. You can also submit your details for further engagement.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page to contribute.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.