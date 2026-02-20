# ♟️ Chess Game Gathering & Viewer

![alt text](https://raw.githubusercontent.com/danielgestwa/4boards/refs/heads/master/images/image.png "4Boards App")

A complete system for:

1. Collecting live chess games from https://www.chess.com using a Tampermonkey userscript  
2. Storing live board snapshots in a local database via a Go (Gin) backend  
3. Displaying and replaying games in a browser using chessboard.js  

This project allows you to automatically capture live games from Chess.com and replay them locally through your own web interface.

---

# 🧱 Architecture Overview

## 1️⃣ Tampermonkey Userscript

- Runs on: https://www.chess.com/game/*
- Extracts:
  - White player name + time
  - Black player name + time
  - Current board state
  - Game result
  - Game number (from URL)
- Sends updates every 100ms to:
  
  http://localhost:8000/games

- Only sends data when the board state changes

## 2️⃣ Go Backend (Gin Framework)

- Accepts POST requests at `/games`
- Stores board snapshots in a local database
- Serves web UI for browsing and replaying games

## 3️⃣ Frontend Viewer

- Uses chessboard.js for rendering board positions
- Displays saved positions
- Allows replaying game states

---

# 🚀 Features

- Live board state extraction
- Automatic result detection
- Snapshot-based game tracking
- Local storage
- Web-based replay interface
- Fully self-hosted

---

# 📜 Userscript Behavior

The script:

- Reads the `wc-chess-board` DOM element
- Detects pieces using CSS classes (wp, bq, etc.)
- Converts numeric square positions to algebraic notation (e4, a1, etc.)
- Builds a JSON payload containing:

```json
{
  "game_number": "123456789",
  "white": "Player1",
  "black": "Player2",
  "time_white": "5:32",
  "time_black": "4:59",
  "board": "{\"e4\":\"wP\",\"e5\":\"bP\"}",
  "result": "Playing..."
}
```

The script compares the current payload to the previous one and only sends updates when something changes.

When the game ends:
- It detects the result
- Optionally reloads or closes the tab (based on cookie queue logic)

---

# 🧠 Technical Notes

- Board stored as JSON: `{square: piece}`
- Piece codes:
  - wP, wR, wN, wB, wK, wQ
  - bP, bR, bN, bB, bK, bQ
- Squares use algebraic notation: a1–h8
- Update interval: 100ms
- Change detection via payload comparison

---

# ⚠️ Important Notes

- For educational and personal use.
- Ensure compliance with Chess.com Terms of Service.
- Backend must be running before games start.
- CORS may require configuration depending on setup.

---

# ♟️ Summary

This project provides a fully local, automated chess game tracker and viewer powered by:

- Tampermonkey automation
- Go + Gin backend
- chessboard.js frontend

It enables automatic collection and replay of live Chess.com games in your own local environment.
