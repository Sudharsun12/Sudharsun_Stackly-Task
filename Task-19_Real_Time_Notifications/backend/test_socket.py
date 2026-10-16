from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, async_mode='threading', cors_allowed_origins='*')

@socketio.on('connect')
def on_connect():
    print('[TEST] Client connected!')

if __name__ == '__main__':
    print('Starting minimal test server on port 5001...')
    socketio.run(app, port=5001, use_reloader=False, allow_unsafe_werkzeug=True)
