"""Simple greeting script that prints a friendly message."""

from __future__ import annotations

import argparse


def build_parser() -> argparse.ArgumentParser:
    """Create an argument parser for the CLI."""
    parser = argparse.ArgumentParser(
        description="Print a friendly greeting. Provide a name to personalize it."
    )
    parser.add_argument(
        "name",
        nargs="?",
        default="there",
        help="Name to include in the greeting (defaults to 'there').",
    )
    return parser


def greet(name: str) -> str:
    """Return a greeting for the provided name."""
    sanitized = name.strip() or "there"
    return f"Hello, {sanitized}!"


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    print(greet(args.name))


if __name__ == "__main__":
    main()
