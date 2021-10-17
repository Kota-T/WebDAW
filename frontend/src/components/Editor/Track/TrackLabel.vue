<template>
  <div
  class="track-label"
  :class="{'is-selected': isSelected}"
  @pointerdown="select"
  @contextmenu="$refs.menu.show"
  @touchstart="$refs.menu.show"
  >
    <div class="track-type">
      <slot name="track-type"></slot>
    </div>
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
  position: relative;
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
.track-label .track-type{
  color: white;
  position: absolute;
  top: 3px;
  left: 3px;
}
</style>

<script>
export default {
  name: 'TrackLabel',
  props: {
    isSelected: Boolean
  },
  emits: ['update:isSelected', 'track-select', 'track-remove'],
  methods: {
    select(e){
      this.$emit('update:isSelected', true);
      this.$emit('track-select', e.shiftKey);
    }
  }
}
</script>
