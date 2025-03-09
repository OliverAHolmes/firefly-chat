#!/bin/sh
# Create a folder (named dmg) to prepare our DMG in (if it doesn't already exist).

pyinstaller \
    --noconfirm \
    --onedir \
    --name 'Test' \
    --windowed main.py \
    --icon img/logo.icns \
    --add-data "img:img"  \
    --add-data ".env:.env"  \
    --add-data "frontend/dist:frontend/dist" \
    --add-data "data:data" \
    --collect-all openai \
    --collect-all webview \
    # --collect-all sqlite3 \
    # --collect-all contextlib \
    # --collect-all logging \
    # --collect-all typing \
    # --collect-all pathlib \
    # --collect-all dotenv 