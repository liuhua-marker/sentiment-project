<template>
  <li class="timeline-title" :style="itemStyle">
    <div
      ref="others"
      class="timeline-circle timeline-title-circle"
      :class="slotClass"
      :style="circleStyle"
    >
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
