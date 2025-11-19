# Snake Game

This repository contains two implementations of the classic Snake game:

- A feature-rich version for modern web browsers built with HTML, CSS, and JavaScript.
- A minimalist version for the terminal written in Python using the `curses` module.

## Web Version

The primary version of the game runs in any modern web browser. It features a clean interface, a scoreboard, and controls to start, pause, and retry.

### How to Play

1.  Open the `index.html` file in your web browser.
2.  Click the **Start** button to begin.
3.  On desktop or laptop browsers, use the **arrow keys** or **WASD** keys to steer the snake.
4.  On phones or tablets, swipe anywhere on the canvas in the direction you want the snake to travel (horizontal or vertical swipes work best).
5.  Eat the food (`■`) to grow longer and increase your score.
6.  Press the **Pause** button to freeze the game at any time.
7.  Click **Retry** to start a new game after a game over.

### Files

- `index.html`: The main HTML file for the game.
- `styles.css`: The stylesheet for the game's appearance.
- `snake.js`: The JavaScript file containing the game logic.

## Terminal Version

A simple version of Snake that can be played in a terminal window.

### Requirements

- Python 3.8 or newer
- A terminal that supports `curses` (e.g., on macOS, Linux, or WSL).

### Running the Game

```bash
python main.py
```

Use the arrow keys to steer the snake. Collect food (`*`) to grow longer and increase your score. Press `q` to quit at any time. Your terminal window must be at least 22 columns by 10 rows.

### Files

- `main.py`: The Python script for the terminal-based game.

## Ideas to Extend

- Add a persistent high-score tracker for the web version using `localStorage`.
- Introduce obstacles or different game modes.
- Port the terminal logic to a graphical UI framework like Pygame or Tkinter.
