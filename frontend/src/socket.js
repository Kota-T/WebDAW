import IdManager from './IdManager.js';

export default class WebDAWSocket {
  static MAX_DATA_SIZE = 10000000;

  constructor(){
    this.packetIdManager = new IdManager(8);
    this.packetBuffer = {};
  }

  init(defaultOnmessage){
    this.defaultOnmessage = defaultOnmessage;
  }

  connect(){
    this.socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/websocket`);
    this.connected = true;
  }

  setDefault(){
    this.onmessage = data => this.defaultOnmessage(data);
  }

  generatePacketId(){
    const packetId = this.packetIdManager.generateId();
    if(this.packetBuffer.hasOwnProperty(packetId)){
      IdManager.removeId(packetId);
      return this.generatePacketId();
    }
    return packetId;
  }

  send(jsonObj){
    const jsonStr = JSON.stringify(jsonObj);
    if(jsonStr.length > WebDAWSocket.MAX_DATA_SIZE){
      if(this.lastSendDataBlobURL)
        URL.revokeObjectURL(this.lastSendDataBlobURL);
      this.lastSendDataBlobURL = URL.createObjectURL(new Blob([jsonStr], {type: 'application/json'}));
      const packetId = this.generatePacketId(8);
      const numOfPackets = Math.ceil(jsonStr.length / WebDAWSocket.MAX_DATA_SIZE);
      for(let i = 0; i < numOfPackets; i++){
        const start = i * WebDAWSocket.MAX_DATA_SIZE;
        let end = start + WebDAWSocket.MAX_DATA_SIZE;
        if(end > jsonStr.length){
          end = jsonStr.length;
        }
        this.socket.send(JSON.stringify({
          type: 'packet',
          target: jsonObj.target,
          packetId: packetId,
          numOfPackets: numOfPackets,
          index: i,
          body: jsonStr.slice(start, end)
        }));
      }
    }else{
      this.socket.send(jsonStr);
    }
  }

  close(){
    this.socket?.close();
  }

  set onopen(fn){
    this.socket.onopen = e=>{
      this.socket.send(JSON.stringify({type: 'ping'}));
      console.info("接続しました。");
      fn(e);
    }
  }

  set onmessage(fn){
    this.socket.onmessage = e=>{
      const data = JSON.parse(e.data);
      if(data.type === 'pong'){
        this.socket.send(JSON.stringify({type: 'ping'}));
        return;
      }
      console.log(data);
      switch(data.type){
        case 'packet':
          if(!this.packetBuffer.hasOwnProperty(data.packetId)){
            this.packetBuffer[data.packetId] = new Array(data.numOfPackets).fill(undefined);
          }
          this.packetBuffer[data.packetId][data.index] = data;

          if(this.packetBuffer[data.packetId].every(packet=>packet)){
            const result = JSON.parse(this.packetBuffer[data.packetId].reduce((acc, cur) => acc + cur.body, ""));
            fn(result);
            delete this.packetBuffer[data.packetId];
          }
          break;
        case 'packet_id_overlapped_error':
          const reader = new FileReader();
          reader.onload(()=>this.send(JSON.parse(reader.result)));
          reader.readAsText(this.lastSendDataBlobURL);
          break;
        case 'msg':
          console.info(data.msg);
          break;
        default:
          fn(data);
      }
    }
  }

  set onclose(fn){
    this.socket.onclose = e=>{
      fn(e);
      this.connected = false;
      console.info("接続が閉じられました。");
    }
  }

  set onerror(fn){
    this.socket.onerror = e=>{
      fn(e);
      this.connected = false;
      console.error(e);
    }
  }
}
