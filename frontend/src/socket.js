export default class WebDAWSocket {
  constructor(funcObj){
    this.funcObj = funcObj;
  }

  connect(){
    this.socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/websocket`);
    this.connected = true;
    this.setDefault();
  }

  setDefault(){
    this.socket.onmessage = e=>this.defaultOnmessage(e);
  }

  defaultOnmessage(e){
    const data = JSON.parse(e.data);
    switch(data.type){
      case 'track':
        this.funcObj.acceptTrack(data.trackData);
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
