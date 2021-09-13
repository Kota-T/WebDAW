export default class WebDAWSocket {
  init(funcObj){
    this.funcObj = funcObj;
    this.buffer = {};
  }

  connect(){
    this.socket = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/websocket`);
    this.connected = true;
  }

  setDefault(){
    this.onmessage = data=>this.defaultOnmessage(data);
  }

  defaultOnmessage(data){
    switch(data.type){
      case 'addTrack':
        console.log(data);
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

  generatePacketId(){
    const ch_list = []
    for(let i = 0; i < 26; i++)
      ch_list.push(String.fromCharCode("a".charCodeAt(0)+i));
    for(let i = 0; i < 26; i++)
      ch_list.push(String.fromCharCode("A".charCodeAt(0)+i));
    for(let i = 0; i < 10; i++)
      ch_list.push(i + "")

    const result_list = []
    for(let i = 0; i < 8; i++)
      result_list.push(ch_list[Math.floor(Math.random() * ch_list.length)])

    const packetId = result_list.join('');

    if(this.buffer.hasOwnProperty(packetId))
      return this.generatePacketId()
    return packetId
  }

  send(jsonObj){
    const jsonStr = JSON.stringify(jsonObj);
    if(jsonStr.length > 10000000){
      const packetId = this.generatePacketId();
      const numOfPackets = Math.ceil(jsonStr.length / 10000000);
      for(let i = 0; i < numOfPackets; i++){
        const start = i * 10000000;
        let end = start + 10000000;
        if(end > jsonStr.length){
          end = jsonStr.length;
        }
        this.socket.send(JSON.stringify({
          state: 'packet',
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

  set onopen(fn){
    this.socket.onopen = fn;
  }

  set onmessage(fn){
    this.socket.onmessage = e=>{
      const data = JSON.parse(e.data);
      console.log(data);
      if(data.type === 'packet'){
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
        return;
      }
      fn(data);
      if(data.type === 'closed'){
        console.log(data.msg);
      }
    }
  }

  set onerror(fn){
    this.socket.onerror = fn;
  }
}
