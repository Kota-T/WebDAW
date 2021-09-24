<template>
  <div
  class="track-label"
  :class="{'is-selected': isSelected}"
  @pointerdown="e=>$emit('track-select', e.shiftKey)"
  @contextmenu="$refs.menu.show"
  @touchstart="$refs.menu.show"
  >
    <div>
      <slot name="contents"></slot>
    </div>
  </div>
  <ContextMenu ref="menu">
    <slot name="menu"></slot>
    <li @click.stop="$emit('track-remove')">削除</li>
  </ContextMenu>
</template>

<style>
.track-label{
  background-color: #323232;
  border-right: 1px solid white;
  border-bottom: 1px solid;
  width: 100%;
  height: 120px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
.track-label:hover{
  cursor: pointer;
}
.track-label.is-selected{
  background-color: #606060;
}
</style>

<script>
export default {
  name: 'TrackLabel',
  emits: ['track-select', 'track-remove'],
  data(){
    return {
      isSelected: false,
    }
  }
}
</script>
