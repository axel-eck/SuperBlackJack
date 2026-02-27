<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/nuxt"
</script>

<template>
  <div class="w-screen h-screen flex flex-col items-center justify-center">
    <SpeedInsights />
    <slot />
  </div>
</template>

<style scoped lang="scss">

</style>
