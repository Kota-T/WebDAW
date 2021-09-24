import IdManager from '../../../IdManager.js';

const CanvasContainerMixin = {
  props: ['pointer'],
  inject: ['socket', 'trackId'],
  emits: ['track-select'],
  data(){
    return {
      canvasParams: [],
      canvases: []
    }
  },
  created(){
    this.canvasIdManager = new IdManager(8);
    this.initRecorder();
  },
  methods: {
    setCanvasRef(el){
      if(el && !this.canvases.includes(el)){
        this.canvases.push(el);
      }
    },

    createCanvas(canvasData){
      if(!canvasData.hasOwnProperty('id'))
        canvasData.id = this.canvasIdManager.generateId();
      else
        this.canvasIdManager.storeId(canvasData.id);
      this.canvasParams.push(canvasData);
    },

    createCanvasByUser(canvasData){
      this.createCanvas({ ...canvasData, send: true });
    },

    removeCanvas(canvasId){
      this.canvases = [];
      const index = this.canvasParams.findIndex(canvas => canvas.id === canvasId);
      this.canvasParams.splice(index, 1);
      this.canvasIdManager.removeId(canvasId);
    },

    removeCanvasByUser(canvasId){
      if(!window.confirm("選択されているキャンバスを削除しますか？")) return;
      this.removeCanvas(canvasId);
      if(this.socket.connected){
        this.socket.send({
          type: 'removeCanvas',
          trackId: this.trackId,
          canvasId
        });
      }
    },

    startRecording(){
      this.recorder.start();
    },

    stopRecording(){
      this.recorder.stop();
    },

    getCurrentCanvas(startPoint){
      return this.canvases.find(
        canvas => canvas && canvas.startPoint <= startPoint && canvas.endPoint >= startPoint
      );
    },

    play(){
      const loop = ()=>{
        const pointerX = this.pointer.x;
        const canvas = this.getCurrentCanvas(pointerX);
        if(canvas && canvas !== this.currentCanvas){
          this.currentCanvas?.pause();
          this.currentCanvas = canvas;
          this.currentCanvas.play(pointerX, () => this.currentCanvas = null);
        }
        this.playId = requestAnimationFrame(loop);
      }
      this.playId = requestAnimationFrame(loop);
    },

    pause(){
      cancelAnimationFrame(this.playId);
      this.currentCanvas?.pause();
      this.currentCanvas = null;
    },

    getDownloadData(folder, ext){
      return this.canvases.map(canvas=>canvas.getDownloadData(folder, ext));
    },

    getUploadData(mimeType){
      return this.canvases.map(canvas=>canvas.getUploadData(mimeType));
    }
  }
}

export default CanvasContainerMixin;
