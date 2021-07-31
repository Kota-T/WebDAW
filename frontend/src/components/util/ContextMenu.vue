<template>
  <div
  class="context-menu"
  tabindex="-1"
  :style="styles"
  v-show="isShow"
  @blur="isShow=false;"
  ref="domElement"
  >
    <ul>
      <slot></slot>
    </ul>
  </div>
</template>

<style>
.context-menu{
  background-color: white;
  padding: 5px 0;
  font-size: 12px;
  text-align: center;
  border-radius: 10px;
  width: 100px;
  position: fixed;
  z-index: 4;
}
.context-menu ul{
  list-style: none;
}
.context-menu li:hover{
  color: white;
  background-color: blue;
  cursor: pointer;
}
</style>

<script>
export default {
  name: 'ContextMenu',
  data(){
    return {
      styles: {
        top  : '0px',
        left : '0px'
      },
      isShow: false
    }
  },
  methods: {
    show(e){
      this.isShow = true;
      this.styles.top = e.clientY + 'px';
      this.styles.left = e.clientX + 'px';
      this.$refs.domElement.focus();
    },
  }
}
</script>
