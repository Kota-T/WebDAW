<template>
  <SideMenu>
    <a @click="downloadProject">プロジェクトファイルをダウンロード</a>
    <a @click="isShowPopup=true;popUpType='WriteRange';">選択範囲を書き出す</a>
    <template v-if="projectId === null">
      <a @click="shareProject">プロジェクトを共有</a>
      <a>プロジェクトに参加:<textarea cols="2" rows="1" style="resize:none;text-align:right" @keydown.enter="joinProject" ref="projectIdField"></textarea></a>
    </template>
    <a v-else-if="projectId === 'loading'">Loading...</a>
    <a v-else>プロジェクトID: {{ projectId }}</a>
  </SideMenu>
  <Popup v-show="isShowPopup">
    <WriteRange v-if="popUpType === 'WriteRange'" @hide-popup="isShowPopup=false" @write-project="$refs.editor.writeProjectAudio"/>
  </Popup>
  <Editor ref="editor"/>
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
import SideMenu from './components/SideMenu.vue';
import Popup from './components/Popup.vue';
import WriteRange from './components/WriteRange.vue';
import Editor from './components/Editor.vue';

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
      ajax: null
    }
  },
  methods: {
    shareProject(){
      this.projectId = "loading";
      this.ajax = new WebSocket(`wss://${location.host}/websocket`);
      this.ajax.onerror = err=>{
        this.projectId = null;
        console.error(err);
      }
      this.ajax.onopen = async () => this.ajax.send(JSON.stringify({
        state: "shareProject",
        project: await this.$refs.editor.getUploadData()
      }));
      this.ajax.onmessage = e=>{
        const data = JSON.parse(e.data);
        switch(data.type){
          case 'id':
            this.projectId = data.id;
            console.log("shareProject" + this.projectId);
            break;
          case 'error':
            this.projectId = null;
            console.log(data.msg);
            break;
        }
      }
    },

    joinProject(){
      this.projectId = "loading";
      const id = this.$refs.projectIdField.value;
      this.ajax = new WebSocket(`wss://${location.host}/websocket`);
      this.ajax.onerror = err=>{
        this.projectId = null;
        console.error(err);
      }
      this.ajax.onopen = async () => this.ajax.send(JSON.stringify({
        state: "joinProject",
        id: id
      }));
      this.ajax.onmessage = async e=>{
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
      }
    }
  }
}
</script>
