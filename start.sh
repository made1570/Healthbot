
python3 ml_server.py &
PYTHON_PID=$!

sleep 1

npx nodemon server.js &
NODE_PID=$!

cleanup() {
  echo "Shutting down servers..."
  kill $PYTHON_PID
  kill $NODE_PID
  exit
}

trap cleanup SIGINT

wait $NODE_PID
