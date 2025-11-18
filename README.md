## Terminal Snake Game

This repository contains a minimalist implementation of the classic Snake game\
for the terminal using Python's built-in `curses` module.

### Requirements

- Python 3.8 or newer
- A terminal that supports curses (macOS, Linux, WSL, etc.)

### Running the Game

```bash
python main.py
```

Use the arrow keys to steer the snake. Collect food (`*`) to grow longer and\
increase your score. Press `q` to quit at any time. You will need a terminal\
window of at least 20 columns by 10 rows.

### Play in the Browser

A modern browser version of the game lives in `web/`.

```bash
cd web
python -m http.server 8000
```

Then open `http://localhost:8000` and click the **Start** button. Use the arrow\
keys or WASD to move, `Pause` to freeze, and `Retry` to start a new run.

### Ideas to Extend

- Add a persistent high-score tracker.
- Introduce obstacles or different game modes.
- Port the logic to a GUI framework such as pygame or tkinter.
