export default class WebDAWSocket {
  static MAX_DATA_SIZE = 10000000;

  init(defaultOnmessage){
    this.defaultOnmessage = defaultOnmessage;
    this.buffer = {};
  }

  connect(){
    this.socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/websocket`);
    this.connected = true;
  }

  setDefault(){
    this.onmessage = data=>this.defaultOnmessage(data);
  }

  generatePacketId(length){
    const ch_list = [];
    for(let i = 0; i < 26; i++)
      ch_list.push(String.fromCharCode("a".charCodeAt(0)+i));
    for(let i = 0; i < 26; i++)
      ch_list.push(String.fromCharCode("A".charCodeAt(0)+i));
    for(let i = 0; i < 10; i++)
      ch_list.push(String(i));

    let packetId = "";
    for(let i = 0; i < length; i++)
      packetId += ch_list[Math.floor(Math.random() * ch_list.length)];

    if(this.buffer.hasOwnProperty(packetId))
      return this.generatePacketId();
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
      this.intervalId = setInterval(()=>this.socket.send(JSON.parse({type: 'ping'})), 1000);
      console.info("接続しました。");
      fn(e);
    }
  }

  set onmessage(fn){
    this.socket.onmessage = e=>{
      const data = JSON.parse(e.data);
      console.log(data);
      switch(data.type){
        case 'packet':
          if(!this.buffer.hasOwnProperty(data.packetId)){
            this.buffer[data.packetId] = [];
            for(let i = 0; i < data.numOfPackets; i++)
              this.buffer[data.packetId].push(undefined);
          }
          this.buffer[data.packetId][data.index] = data;

          if(this.buffer[data.packetId].every(packet=>packet)){
            const result = JSON.parse(this.buffer[data.packetId].reduce((acc, cur) => acc + cur.body, ""));
            fn(result);
            delete this.buffer[data.packetId];
          }
          break;
        case 'packet_id_overlapped_error':
          const reader = new FileReader();
          reader.onload(()=>this.send(JSON.parse(reader.result)));
          reader.readAsText(this.lastSendDataBlobURL);
          break;
        case 'closed':
        case 'error':
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
      clearInterval(this.intervalId);
      console.info("接続が閉じられました。");
    }
  }

  set onerror(fn){
    this.socket.onerror = e=>{
      fn(e);
      console.error(e);
    }
  }
}
