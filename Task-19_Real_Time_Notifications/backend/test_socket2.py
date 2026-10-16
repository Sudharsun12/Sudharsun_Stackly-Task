# Test 2: Does adding flask_cors break socket.io?
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
app.secret_key = 'shopsphere_secret_key_2026'

CORS(app, supports_credentials=True, origins=[
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
])
bcrypt = Bcrypt(app)

socketio = SocketIO(app, async_mode='threading', cors_allowed_origins='*')

@socketio.on('connect')
def on_connect():
    print('[TEST2] Client connected!')

if __name__ == '__main__':
    print('Starting test2 on port 5002...')
    socketio.run(app, port=5002, use_reloader=False, allow_unsafe_werkzeug=True)
