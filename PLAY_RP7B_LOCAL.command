#!/bin/bash
# ★ RP7B · play from this folder with 2DHD.
#   Double-click in Finder. Opening rp7b.html directly (file://) cannot run
#   2DHD: Chrome blocks module scripts there and keeps game art out of WebGL.
#   This serves the folder on http://localhost and opens the game in 2DHD.
#   Close this Terminal window (or press Ctrl+C) to stop.
cd "$(dirname "$0")" || exit 1
PORT=8765
URL="http://localhost:$PORT/rp7b.html?hd=1"
if lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  echo "A server is already running on port $PORT · opening the game."
  open "$URL"
  exit 0
fi
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
open "$URL"
echo ""
echo "  RP7B 2DHD is running at $URL"
echo "  Cmd+F in game switches 2DHD <-> classic."
echo "  Close this window (or Ctrl+C) to stop the server."
echo ""
wait $SERVER
