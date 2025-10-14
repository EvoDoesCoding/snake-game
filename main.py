"""Terminal Snake game implemented with Python's curses module."""

from __future__ import annotations

import curses
import random
from dataclasses import dataclass
from typing import Deque, Iterable, Tuple
from collections import deque


# Directions are expressed as (row_delta, col_delta).
DIRECTIONS: dict[int, Tuple[int, int]] = {
    curses.KEY_UP: (-1, 0),
    curses.KEY_DOWN: (1, 0),
    curses.KEY_LEFT: (0, -1),
    curses.KEY_RIGHT: (0, 1),
}


@dataclass(frozen=True)
class Point:
    row: int
    col: int

    def __add__(self, other: Tuple[int, int]) -> Point:
        dr, dc = other
        return Point(self.row + dr, self.col + dc)


class SnakeGame:
    """Stateful Snake game that renders inside a curses window."""

    def __init__(self, screen: curses.window) -> None:
        self.screen = screen
        max_y, max_x = screen.getmaxyx()
        if max_y < 10 or max_x < 20:
            raise ValueError("Terminal window too small for Snake (min 20x10).")
        self.play_area = (max_y - 2, max_x - 2)  # usable cells inside the border
        self.snake: Deque[Point] = deque()
        self.food: Point | None = None
        self.current_direction: Tuple[int, int] = DIRECTIONS[curses.KEY_RIGHT]
        self.pending_direction: Tuple[int, int] = self.current_direction
        self.speed_ms = 150  # initial delay between moves in milliseconds
        self.score = 0

    # Game setup and loop -------------------------------------------------
    def start(self) -> None:
        self._setup_screen()
        self._spawn_initial_snake()
        self._place_food()
        self._game_loop()

    def _setup_screen(self) -> None:
        self.screen.clear()
        self.screen.nodelay(True)
        self.screen.keypad(True)
        curses.curs_set(0)
        self._draw_border()
        self._draw_score()

    def _spawn_initial_snake(self) -> None:
        max_rows, max_cols = self.play_area
        center = Point(max_rows // 2, max_cols // 2)
        self.snake.clear()
        self.snake.append(center)
        self.snake.append(Point(center.row, center.col - 1))
        self.snake.append(Point(center.row, center.col - 2))
        for segment in self.snake:
            self._draw_cell(segment, "#")

    def _game_loop(self) -> None:
        while True:
            self.screen.timeout(self.speed_ms)
            key = self.screen.getch()
            if key in DIRECTIONS:
                self._queue_direction(DIRECTIONS[key])
            elif key in (ord("q"), ord("Q")):
                break

            if not self._advance():
                break

        self._show_game_over()
        self.screen.nodelay(False)
        self.screen.getch()

    # Game mechanics ------------------------------------------------------
    def _queue_direction(self, direction: Tuple[int, int]) -> None:
        # Prevent reversing directly into the snake's body.
        opposite = (-self.current_direction[0], -self.current_direction[1])
        if direction != opposite:
            self.pending_direction = direction

    def _advance(self) -> bool:
        self.current_direction = self.pending_direction
        new_head = self.snake[0] + self.current_direction
        if not self._inside_board(new_head) or new_head in self.snake:
            return False

        self.snake.appendleft(new_head)
        self._draw_cell(new_head, "@")

        if self.food and new_head == self.food:
            self.score += 1
            self._draw_score()
            self._place_food()
            self._reduce_delay()
        else:
            tail = self.snake.pop()
            self._draw_cell(tail, " ")
        return True

    def _place_food(self) -> None:
        free_cells = set(self._iter_board_cells()) - set(self.snake)
        if not free_cells:
            self.food = None
            return
        self.food = random.choice(list(free_cells))
        self._draw_cell(self.food, "*")

    def _reduce_delay(self) -> None:
        self.speed_ms = max(50, int(self.speed_ms * 0.95))

    # Rendering helpers ---------------------------------------------------
    def _draw_border(self) -> None:
        self.screen.border("|", "|", "-", "-", "+", "+", "+", "+")

    def _draw_score(self) -> None:
        score_text = f" Score: {self.score} "
        self.screen.addstr(0, 2, score_text)
        self.screen.clrtoeol()

    def _draw_cell(self, point: Point, char: str) -> None:
        # Offset by 1 to account for the border.
        self.screen.addch(point.row + 1, point.col + 1, char)

    # Utility -------------------------------------------------------------
    def _inside_board(self, point: Point) -> bool:
        rows, cols = self.play_area
        return 0 <= point.row < rows and 0 <= point.col < cols

    def _iter_board_cells(self) -> Iterable[Point]:
        rows, cols = self.play_area
        for r in range(rows):
            for c in range(cols):
                yield Point(r, c)

    def _show_game_over(self) -> None:
        rows, cols = self.play_area
        center_row = rows // 2
        message = f" Game over! Final score: {self.score}. Press any key. "
        x = max(1, (cols - len(message)) // 2)
        y = center_row
        self.screen.addstr(y, x, message)
        self.screen.refresh()


def run() -> None:
    """Launch the Snake game inside a curses wrapper."""
    curses.wrapper(lambda screen: SnakeGame(screen).start())


if __name__ == "__main__":
    run()
