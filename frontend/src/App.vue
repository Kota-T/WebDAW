<template>
  <SideMenu>
    <a @click="$refs.editor.downloadProject">プロジェクトファイルをダウンロード</a>
    <a @click="showDialog('WriteRange')">選択範囲を書き出す</a>
    <a v-if="projectId === null">プロジェクトを共有<br>
      <input size="8" @keydown.enter.prevent="startProject($event.target.value)">
    </a>
    <a v-else-if="projectId === 'loading'">Loading...</a>
    <template v-else>
      <a>プロジェクトID: {{ projectId }}</a>
      <a @click="endProject">共有を停止する</a>
    </template>
    <a href="/docs/" target="_blank">ヘルプ</a>
    <VideoContainer v-if="projectId !== 'loading' && projectId !== null" :roomId="projectId" ref="videoContainer"/>
  </SideMenu>
  <Dialog v-show="isShowDialog" @hide-dialog="isShowDialog=false">
    <ChooseTrackComponent
    v-if="dialogType === 'ChooseTrackComponent'"
    @choose-track-component="component=>$refs.editor.addTrackByUser({component})"
    @hide-dialog="isShowDialog=false"
    />
    <WriteRange
    v-else-if="dialogType === 'WriteRange'"
    @write-project="$refs.editor.writeProjectAudio"
    @hide-dialog="isShowDialog=false"
    />
  </Dialog>
  <Editor @add-track="showDialog('ChooseTrackComponent')" ref="editor"/>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto&family=Sawarabi+Gothic&display=swap');
*{
  font-family: 'Roboto', 'Sawarabi Gothic', sans-serif;
  font-weight: normal;
  font-size: 1rem;
  margin: 0;
  border: 0;
  padding: 0;
  box-sizing: border-box;
}
body{
  overflow: hidden;
}
</style>

<script>
import WebDAWSocket from './socket.js';

import SideMenu from './components/SideMenu.vue';
import VideoContainer from './components/VideoContainer.vue';
import Dialog from './components/Dialog/Dialog.vue';
import ChooseTrackComponent from './components/Dialog/ChooseTrackComponent.vue';
import WriteRange from './components/Dialog/WriteRange.vue';
import Editor from './components/Editor/Editor.vue';

export default {
  name: 'App',
  components: {
    SideMenu,
    VideoContainer,
    Dialog,
    ChooseTrackComponent,
    WriteRange,
    Editor
  },
  data(){
    return {
      isShowDialog: false,
      dialogType: null,
      projectId: null,
    }
  },
  provide(){
    this.socket = new WebDAWSocket();
    return {
      socket: this.socket
    }
  },
  mounted(){
    window.onpopstate = e => e.preventDefault();
    window.onbeforeunload = e=>{
      e.preventDefault();
      e.returnValue = 'ページを移動すると全てのデータが失われます。';
    }
    window.onorientationchange = this.alertScreenOrientation;
    window.onload = ()=>{
      this.alertScreenOrientation();
      if(location.search.substring(0, 4) === "?id="){
        this.startProject(location.search.substring(4));
      }
    }

    window.ontouchmove = e=>e.preventDefault();

    this.socket.init(async data=>{
      switch(data.type){
        case 'joinProject':
          this.socket.send({
            type: 'shareProject',
            target: data.target,
            projectData: await this.$refs.editor.getUploadData()
          });
          break;
        case 'changeBpm':
          this.$refs.editor.$refs.bpm.init(data.value);
          break;
        case 'changeRhythm':
          this.$refs.editor.$refs.rhythm.init(data.value);
          break;
        case 'addTrack':
          this.$refs.editor.addTrack(data.trackData);
          break;
        case 'removeTrack':
          this.$refs.editor.removeTrack(data.trackId);
          break;
        case 'changeTrackName':
          this.$refs.editor.tracks.find(track=>track.id===data.trackId).name = data.value;
          break;
        case 'addCanvas':
          this.$refs.editor.tracks.find(track=>track.id===data.trackId).$refs.container.createCanvas(data.canvasData);
          break;
        case 'removeCanvas':
          this.$refs.editor.tracks.find(track=>track.id===data.trackId).$refs.container.removeCanvas(data.canvasId);
          break;
      }
    });
  },
  methods: {
    alertScreenOrientation(){
      const angle = window.screen?.orientaion?.angle || window.orientation;
      if(window.screen.width < 550 && angle === 0)
        alert("画面を横向きにしてください。")
    },

    showDialog(dialogType){
      this.isShowDialog = true;
      this.dialogType = dialogType;
    },

    startProject(id){
      this.projectId = "loading";
      this.socket.connect();
      this.socket.onclose = e => this.projectId = null;
      this.socket.onerror = e => this.projectId = null;
      this.socket.onopen = () => {
        this.socket.send({ type: "startProject", id: id });
        this.socket.onmessage = data => {
          switch(data.type){
            case 'startProject':
              this.projectId = id;
              console.info("プロジェクトを共有しました。id: " + this.projectId);
              break;
            case 'shareProject':
              this.projectId = id;
              this.$refs.editor.loadSharedProject(data.projectData);
              break;
          }
          this.socket.setDefault();
        }
      }
    },

    endProject(){
      this.socket.close();
      this.$refs.videoContainer.room.close();
    }
  }
}
</script>
