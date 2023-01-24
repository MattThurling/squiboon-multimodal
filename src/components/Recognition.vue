<template>
  <div class="central" id="recognition">
    <svg-icon
      class="pointy"
      @click="$emit('clickMic')"
      type="mdi"
      :class="micClass"
      :path="path"
      :size="256">
    </svg-icon>
  </div>
</template>


<script>
  import SvgIcon from '@jamescoyle/vue-icon'
  import { mdiMicrophone } from '@mdi/js'
  export default {
    components: {
      SvgIcon
    },
    props: [
      'micClass'
    ],
    data() {
      return {
        path: mdiMicrophone,
      }
    },
  }
</script>