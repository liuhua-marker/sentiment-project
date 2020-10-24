<template>
  <li class="timeline-item" :style="itemStyle">
    <div ref="others" class="timeline-circle" :class="slotClass" :style="circleStyle">
      <slot name="others" />
    </div>
    <slot />
  </li>
</template>

<script>
import timelineItemBase from './timelineItemBase.vue'

export default {
  extends: timelineItemBase
}
</script>
