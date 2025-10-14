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

### Ideas to Extend

- Add a persistent high-score tracker.
- Introduce obstacles or different game modes.
- Port the logic to a GUI framework such as pygame or tkinter.
