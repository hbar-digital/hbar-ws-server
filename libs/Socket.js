const EventEmitter = require('events');

module.exports = class Socket extends EventEmitter {
  constructor(socket) {
    super();
    this.dispatchEvent = this.emit;
    this.emit = this._emit;

    this._socket = socket;
    this.sessionId = this._getSessionId();

    this._socket.on('data', this._onMessage.bind(this));
    this._socket.on('close', this._onClose.bind(this));

    this.rooms = [ this.sessionId ];
  }

  join(room) {
    this.rooms.push(room);
  }

  leave(room) {
    this.rooms = this.rooms.filter(r => r != room);
  }

  _getSessionId() {
    let parts = this._socket.url.split('/');
    return parts[parts.length - 2];
  }

  _emit(topic, data) {
    this._socket.write(JSON.stringify({ topic : topic, data : data }));
  }

  _onMessage(rawData) {
    let data = JSON.parse(rawData);

    if(data.topic == 'ping') this._emit('pong');
    else this.dispatchEvent(data.topic, data.data);
  }

  _onClose() {
    if(this.onclose) this.onclose();
  }
}
