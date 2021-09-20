<template>
  <div id="header">
    <Count ref="count" :audioCtx="audioCtx"/>
    <Rhythm ref="rhythm"/>
    <img src="../../assets/play.png"  class="play-or-pause" v-show="state === null" @click="play">
    <img src="../../assets/pause.png" class="play-or-pause" v-show="state === 'playing'"  @click="pause">
    <button type="button" id="start" @click="state === 'preparing' || state === 'recording' ? stopRecording() : startRecording()">R</button>
    <Bpm ref="bpm"/>
    <Resizer ref="resizer"/>
  </div>
  <div id="label_field" class="no-scroll-bar" ref="label_field">
    <AddTrackBtn @add-track="addTrackByUser"/>
  </div>
  <div id="pointer_layer" class="no-scroll-bar" ref="pointer_layer">
    <Pointer :margin="20" @move="onPointerMove" ref="pointer"/>
    <div id="ruler_layer" class="no-scroll-bar" ref="ruler_layer">
      <Ruler ref="ruler"/>
    </div>
  </div>
  <Track
  v-for="(data, index) in trackParams"
  :key="data.id"
  :data="data"
  :audioCtx="audioCtx"
  :sourceNode="sourceNode"
  :pointer="$refs.pointer"
  :ref="setTrackRef"
  @track-solo="makeTracksSolo"
  @track-remove="removeTrackByUser(index)"
  />
</template>

<style>
:root{
  --header-height: 80px;
  --label-field-width: 200px;
  --pointer-margin: 20px;
}
#header{
  background-color: #323232;
  width: 100vw;
  height: var(--header-height);
  border-bottom: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
}
#header > *{
  margin: 0 10px;
}
.play-or-pause{
  display: block;
  width: 40px;
  height: 40px;
}
.play-or-pause:hover{
  cursor: pointer;
}
#start{
  font-size: 30px;
  display: block;
  background-color: red;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
#start:hover{
  cursor: pointer;
}
.no-scroll-bar{
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scroll-bar::-webkit-scrollbar{
  display: none;
}
#label_field{
  width: var(--label-field-width);
  position: absolute;
  top: var(--header-height);
  bottom: 0;
  left: 0;
  overflow-y: scroll;
}
#pointer_layer{
  background-color: #323232;
  position: absolute;
  top: var(--header-height);
  right: 0;
  bottom: 0;
  left: var(--label-field-width);
  overflow-x: scroll;
  overflow-y: hidden;
  font-size: 0;
  touch-action: manipulation;
}
#ruler_layer{
  background-color: #323232;
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--pointer-margin);
  overflow-x: visible;
  overflow-y: scroll;
  font-size: 0;
  touch-action: manipulation;
}
</style>

<script>
import JSZip from 'jszip';

import WavHandler from '../../webaudio/WavHandler.js';

import Count from './Header/Count.vue';
import Rhythm from './Header/Rhythm.vue';
import Bpm from './Header/Bpm.vue';
import Resizer from './Header/Resizer.vue';

import AddTrackBtn from './AddTrackBtn.vue';
import Ruler from './Ruler.vue';
import Pointer from './Pointer.vue';
import Track from './Track/Track.vue';

export default {
  name: 'Editor',
  components: {
    Count,
    Rhythm,
    Bpm,
    Resizer,
    AddTrackBtn,
    Ruler,
    Pointer,
    Track
  },
  props: ['socket'],
  data(){
    return {
      trackParams: [],
      lastTrackId: 0,
      tracks: [],
      audioCtx: null,
      sourceNode: null,
      state: null//"playing" or "preparing" or "recording" or null
    }
  },
  created(){
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.audioCtx.onstatechange = () => {
      if(this.audioCtx.state !== 'running')
        this.audioCtx.resume();
    }
  },
  mounted(){
    const label_field = this.$refs.label_field;
    const pointer_layer = this.$refs.pointer_layer;
    const ruler_layer = this.$refs.ruler_layer;

    label_field.onscroll = e=>ruler_layer.scrollTop = label_field.scrollTop;
    ruler_layer.onscroll = e=>label_field.scrollTop = ruler_layer.scrollTop;

    const label_field_width = 200;
    pointer_layer.onclick = e=>{
      if(this.state === "recording") return;
      this.$refs.pointer.layerX = e.clientX - label_field_width + pointer_layer.scrollLeft;
      this.$refs.count.setNumberFromPointerX(this.$refs.pointer.x);
      if(this.state === "playing"){
        this.pause();
        this.play();
      }
    }

    let oldDiff;
    const getDiff = touches=>{
      const x1 = touches[0].clientX;
      const y1 = touches[0].clientY;

      const x2 = touches[1].clientX;
      const y2 = touches[1].clientY;
      return Math.sqrt(Math.pow(x2 - x1, 2), Math.pow(y2 - y1));
    }
    ruler_layer.ontouchstart = e=>{
      if(this.state === "recording" || e.touches.length !== 2) return;
      oldDiff = getDiff(e.touches);
    }
    ruler_layer.ontouchmove = e=>{
      if(this.state === "recording" || e.touches.length !== 2) return;
      e.preventDefault();
      const curDiff = getDiff(e.touches);
      const newVal = Math.round(this.$store.state.beat_interval * curDiff / oldDiff);
      if(10 < newVal && newVal < 100){
        this.$refs.resizer.value = newVal;
        this.$store.commit('beat_interval', newVal);
        oldDiff = curDiff;
      }
    }

    document.ondragover = e=>{
      e.stopPropagation();
      e.preventDefault();
    }

    document.ondrop = async e=>{
      e.stopPropagation();
      e.preventDefault();

      const items = e.dataTransfer.items;

      if(items.length === 1){
        const item = items[0];
        const entry = item.getAsEntry?.() || item.webkitGetAsEntry?.();

        if(entry.isFile){
          entry.file(
            async file=>{
              if(this.isAudioFile(file)){
                this.loadAudioFile(file);
              }else if(file.type === 'application/zip'){
                const data = await this.readProjectZip(file);
                this.loadProject(data);
              }
            },
            console.error
          );
        }else if(entry.isDirectory){
          const data = await this.readProjectDirectory(entry);
          this.loadProject(data);
        }
      }
    }

    document.onkeydown = e=>{
      switch(e.key){
        case "r":
          this.state !== "recording" ? this.startRecording() : undefined;
          break;
        case "Backspace":
          this.state !== "recording" ? this.removeSelectedTracks() : undefined;
          break;
        case " ":
          e.preventDefault();
          switch(this.state){
            case "preparing":
            case "recording":
              this.stopRecording();
              break;
            case "playing":
              this.pause();
              break;
            default:
              this.play();
              break;
          }
          break;
      }
    }
  },
  methods: {
    setTrackRef(el){
      if(el && !this.tracks.includes(el)){
        this.tracks.push(el);
      }
    },

    async getStream(){
      if(this.sourceNode?.mediaStream?.active){ return; }
      await navigator.mediaDevices
        .getUserMedia(
          {
            video: false,
            audio: {
              autoGainControl: false,
              echoCancellation: false,
              noiseSuppression: false,
              sampleRate: 44100
            }
          }
        )
        .then(stream=>{
          this.sourceNode = this.audioCtx.createMediaStreamSource(stream);
        })
        .catch(err=>{
          window.alert("マイク入力を取得できません。");
          throw new Error();
        })
    },

    async addTrack(trackData={}){
      try{ await this.getStream(); }catch(e){ return; }
      trackData.id = this.lastTrackId;
      this.trackParams.push(trackData);
      this.lastTrackId++;
    },

    async addTrackByUser(trackData){
      await this.addTrack(trackData);

      if(this.socket.connected){
        this.$nextTick(async function(){
          this.socket.send({
            type: "addTrack",
            trackData: await this.tracks[this.tracks.length - 1].getUploadData()
          });
        });
      }
    },

    removeTrack(index){
      this.tracks = [];
      this.trackParams.splice(index, 1);
    },

    removeTrackByUser(index){
      if(!window.confirm("選択されているトラックを削除しますか？")) return;
      this.removeTrack(index);

      if(this.socket.connected){
        this.$nextTick(function(){
          this.socket.send({
            type: "removeTrack",
            index: index
          });
        });
      }
    },

    removeSelectedTracks(){
      this.tracks
        .filter(track=>track.isSelected)
        .map(track=>this.trackParams.findIndex(param=>param.id===track.data.id))
        .sort((a, b) => b - a)
        .forEach(index=>this.removeTrackByUser(index));
    },

    makeTracksSolo(){
      if(this.tracks.every(track => track.isSolo === false)){
        this.tracks.forEach(track => track.soloNode.gain.value = 1);
      }else{
        this.tracks.forEach(track=>track.soloNode.gain.value = track.isSolo ? 1 : 0);
      }
    },

    onPointerMove({ layerX, x }){
      const pointer_layer = this.$refs.pointer_layer;
      if(this.state === "recording" && layerX - pointer_layer.scrollLeft > pointer_layer.offsetWidth){
        pointer_layer.scrollLeft += pointer_layer.offsetWidth;
      }
      if(x >= this.$store.getters.ruler_width){
        this.$store.commit('addNumberOfBars', 30);
      }
    },

    async startRecording(){
      try{ await this.getStream(); }catch(e){ return; }
      this.selectedTracks = this.tracks.filter(track=>track.isSelected);
      const notSelectedTracks = this.tracks.filter(track=>!track.isSelected);
      if(!this.selectedTracks.length){return;}

      if(this.state === "playing"){
        this.pause();
      }

      this.$refs.pointer.prepareRecording();
      this.$refs.count.setNumberFromPointerX(this.$refs.pointer.x);
      this.$refs.count.start();
      this.$refs.pointer.start();
      notSelectedTracks.forEach(track=>track.play());

      this.state = "preparing";

      setTimeout(()=>{
        if(this.state !== "preparing") return;
        this.state = "recording";
        this.$refs.bpm.disabled = true;
        this.$refs.resizer.disabled = true;
        this.selectedTracks.forEach(track=>track.startRecording());
      }, this.$store.getters.getTimeOfDistance(this.$store.getters.bar_width) * 1000);
    },

    stopRecording(){
      if(this.state === "recording"){
        this.$refs.bpm.disabled = false;
        this.$refs.resizer.disabled = false;
        this.selectedTracks.forEach(track=>track.stopRecording());
        if(this.socket.connected)
          this.$nextTick(function(){this.sendAudioDataArray()});
      }
      this.pause();
    },

    async play(){
      try{ await this.getStream(); }catch(e){ return; }
      this.tracks.forEach(track=>track.play());
      const scale_interval = this.$store.getters.scale_interval;
      const x = this.$refs.pointer.x;
      const remain_interval = x > 0 ? scale_interval - x % scale_interval : -(x % scale_interval);
      const start_time = this.$store.getters.getTimeOfDistance(remain_interval);
      this.$refs.count.start(start_time);
      this.$refs.pointer.start();
      this.state = "playing";
    },

    pause(){
      this.tracks.forEach(track=>track.pause());
      this.$refs.count.stop();
      this.$refs.pointer.stop();
      this.state = null;
    },

    async sendAudioDataArray(){
      const audioDataArray = await Promise.all(this.selectedTracks.map(async track=>{
        const audioStack = track.$refs.container.audioStack;
        return {
          index: this.tracks.indexOf(track),
          data: await audioStack[audioStack.length - 1].getUploadData()
        };
      }));

      this.socket.send({
        type: "addAudio",
        audioDataArray: audioDataArray
      });
    },

    acceptAudioDataArray(audioDataArray){
      audioDataArray.forEach(audioData=>{
        this.tracks[audioData.index].$refs.container.createAudioCanvas(audioData.data);
      });
    },

    isAudioFile(file){
      return file.type.split('/')[0] === "audio";
    },

    async loadAudioFile(file){
      await this.addTrackByUser({
        audioStack: [
          {
            startPoint: 0,
            url: window.URL.createObjectURL(file)
          }
        ]
      });
    },

    download(url, filename){
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    },

    downloadProject(){
      this.getDownloadData()
        .then(blob=>this.download(URL.createObjectURL(blob), 'project.zip'));
    },

    getProjectConfig(){
      const state = this.$store.state;
      return {
        rhythm: state.rhythm,
        bpm: state.bpm,
        beat_interval: state.beat_interval,
        number_of_bars: state.number_of_bars
      };
    },

    setProjectConfig(json){
      this.$refs.rhythm.init(json.rhythm);
      this.$refs.bpm.init(json.bpm);
      this.$refs.resizer.init(json.beat_interval);
      this.$store.commit('number_of_bars', Number(json.number_of_bars));
    },

    async getDownloadData(){
      const jszip = new JSZip();
      const json = JSON.stringify({
        ...this.getProjectConfig(),
        tracks: await Promise.all(this.tracks.map((track, index)=>track.getDownloadData(jszip, index)))
      });
      jszip.file("config.json", new Blob([json], {type: "application/json"}));
      return jszip.generateAsync({type: "blob"});
    },

    async readProjectZip(file){
      const data = {};
      const promises = [];
      const zip = await JSZip.loadAsync(file);
      zip.forEach((path, file)=>{
        if(file.name === "config.json"){
          promises.push(zip.file(file.name).async("string").then(content => data["config.json"] = JSON.parse(content)));
        }else if(!file.dir){
          let lastDir = data;
          const dirs = file.name.split('/');
          const filename = dirs.pop();
          dirs.forEach(dir=>{
            if(!lastDir[dir]){
              lastDir[dir] = {};
            }
            lastDir = lastDir[dir];
          });
          promises.push(zip.file(file.name).async("blob").then(blob => lastDir[filename] = URL.createObjectURL(blob)));
        }
      });
      await Promise.all(promises);
      return data;
    },

    async readProjectDirectory(entry){
      const data = {};
      await new Promise(resolve=>(function inner(entry, parent, resolve){
        if(entry.isFile){
          entry.file(
            file=>{
              if(file.name === "config.json"){
                const reader = new FileReader();
                reader.onload = e => {
                  parent["config.json"] = JSON.parse(reader.result);
                  resolve();
                };
                reader.readAsText(file);
              }else{
                parent[file.name] = URL.createObjectURL(file);
              }
            },
            console.error
          );
        }else if(entry.isDirectory){
          parent[entry.name] = {};
          entry.createReader().readEntries(
            entries=>entries.forEach(innerEntry=>inner(innerEntry, parent[entry.name], resolve)),
            console.error
          );
        }
      })(entry, data, resolve));
      return Object.values(data)[0];
    },

    loadProject(data){
      this.trackParams = [];
      this.$nextTick(async ()=>{
        const config = data["config.json"];
        this.setProjectConfig(config);
        for await(let trackData of config.tracks){
          trackData.audioStack.forEach((elem, i)=>{
            elem.url = data[trackData.name][i+".wav"];
          });
          await this.addTrackByUser(trackData);
        }
      });
    },

    async getUploadData(){
      return {
        ...this.getProjectConfig(),
        tracks: await Promise.all(this.tracks.map(track=>track.getUploadData()))
      };
    },

    loadSharedProject(project){
      this.trackParams = [];
      this.$nextTick(async ()=>{
        this.setProjectConfig(project);
        for await(let trackData of project.tracks){
          await this.addTrack(trackData);
        }
        console.info("プロジェクトに参加しました。");
      });
    },

    getTimeFromBarAndBeat(bar_and_beat){
      const state = this.$store.state;
      const num_of_scales = bar_and_beat.bar * state.rhythm[0] + bar_and_beat.beat - 1;
      const distance = num_of_scales * this.$store.getters.scale_interval;
      return this.$store.getters.getTimeOfDistance(distance);
    },

    writeProjectAudio(data){
      const startRecordingTime = this.getTimeFromBarAndBeat(data.start);
      const stopRecordingTime = this.getTimeFromBarAndBeat(data.stop);
      const length = (stopRecordingTime - startRecordingTime) * this.audioCtx.sampleRate;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, length, this.audioCtx.sampleRate);
      this.tracks.forEach(track=>track.createOffline(offlineCtx, startRecordingTime, stopRecordingTime));
      offlineCtx.startRendering()
        .then(buffer=>this.download(WavHandler.AudioBuffer2WavFile(buffer), 'project.wav'))
        .catch(console.error);
    }
  }
}
</script>
