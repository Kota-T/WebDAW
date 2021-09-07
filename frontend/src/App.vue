<template>
  <SideMenu>
    <a @click="$refs.editor.downloadProject">プロジェクトファイルをダウンロード</a>
    <a @click="isShowPopup=true;popUpType='WriteRange';">選択範囲を書き出す</a>
    <template v-if="projectId === null">
      <a @click="shareProject">プロジェクトを共有</a>
      <a>プロジェクトに参加:<textarea cols="2" rows="1" @keydown.enter="joinProject" ref="projectIdField"></textarea></a>
    </template>
    <a v-else-if="projectId === 'loading'">Loading...</a>
    <a v-else>プロジェクトID: {{ projectId }}</a>
  </SideMenu>
  <Popup v-show="isShowPopup">
    <WriteRange v-if="popUpType === 'WriteRange'" @hide-popup="isShowPopup=false" @write-project="$refs.editor.writeProjectAudio"/>
  </Popup>
  <Editor :socket="socket" ref="editor"/>
</template>

<style>
*{
  margin: 0;
  border: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<script>
import WebDAWSocket from './socket.js';

import SideMenu from './components/SideMenu.vue';
import Popup from './components/Popup.vue';
import WriteRange from './components/WriteRange.vue';
import Editor from './components/Editor/Editor.vue';

export default {
  name: 'App',
  components: {
    SideMenu,
    Popup,
    WriteRange,
    Editor
  },
  data(){
    return {
      isShowPopup: false,
      popUpType: null,
      projectId: null,
      socket: null
    }
  },
  created(){
    this.socket = new WebDAWSocket();
  },
  mounted(){
    window.onpopstate = e => e.preventDefault();
    window.onbeforeunload = e=>{
      e.preventDefault();
      e.returnValue = 'ページを移動すると全てのデータが失われます。';
    }
    window.onorientationchange = this.alertScreenOrientation;
    window.onload = this.alertScreenOrientation;

    this.socket.init({
      acceptTrack: trackData=>this.$refs.editor.acceptTrack(trackData),
      removeTrack: index=>this.$refs.editor.removeTrack(index),
      acceptAudioDataArray: array=>this.$refs.editor.acceptAudioDataArray(array)
    });
  },
  methods: {
    alertScreenOrientation(){
      const angle = window.screen?.orientaion?.angle || window.orientation;
      if(window.screen.width < 550 && angle === 0)
        alert("画面を横向きにしてください。")
    },

    shareProject(){
      this.projectId = "loading";
      this.socket.connect();
      this.socket.onerror = err=>{
        this.projectId = null;
        console.error(err);
      }
      this.socket.onopen = async () => this.socket.send(JSON.stringify({
        state: "shareProject",
        project: await this.$refs.editor.getUploadData()
      }));
      this.socket.onmessage = e=>{
        const data = JSON.parse(e.data);
        switch(data.type){
          case 'id':
            this.projectId = data.id;
            console.log("shareProject " + this.projectId);
            break;
          case 'error':
            this.projectId = null;
            console.log(data.msg);
            break;
        }
        this.socket.setDefault();
      }
    },

    joinProject(){
      this.projectId = "loading";
      const id = this.$refs.projectIdField.value;
      this.socket.connect();
      this.socket.onerror = err=>{
        this.projectId = null;
        console.error(err);
      }
      this.socket.onopen = async () => this.socket.send(JSON.stringify({
        state: "joinProject",
        id: id
      }));
      this.socket.onmessage = async e=>{
        const data = JSON.parse(e.data);
        switch(data.type){
          case 'project':
            this.projectId = id;
            this.$refs.editor.loadSharedProject(data.project);
            console.log("joinProject " + this.projectId);
            break;
          case 'error':
            this.projectId = null;
            console.log(data.msg);
            break;
        }
        this.socket.setDefault();
      }
    }
  }
}
</script>
