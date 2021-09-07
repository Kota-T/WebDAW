export default class WebDAWSocket {
  init(funcObj){
    this.funcObj = funcObj;
  }

  connect(){
    this.socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/websocket`);
    this.connected = true;
  }

  setDefault(){
    this.socket.onmessage = e=>this.defaultOnmessage(e);
  }

  defaultOnmessage(e){
    const data = JSON.parse(e.data);
    switch(data.type){
      case 'addTrack':
        this.funcObj.acceptTrack(data.trackData);
        break;
      case 'removeTrack':
        this.funcObj.removeTrack(data.index);
        break;
      case 'audio':
        this.funcObj.acceptAudioDataArray(data.audioDataArray);
        break;
    }
  }

  send(arg){
    this.socket.send(arg);
  }

  set onopen(fn){
    this.socket.onopen = fn;
  }

  set onmessage(fn){
    this.socket.onmessage = fn;
  }

  set onerror(fn){
    this.socket.onerror = fn;
  }
}
