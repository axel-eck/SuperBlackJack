<script setup lang="ts">
</script>

<template>
  <div class="w-screen h-screen">
    <h1>Welcome to the Game Lobby</h1>
    <button @click="navigateTo('/games/new')">
      Create New Game
    </button>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

div {
  @apply flex flex-col items-center justify-center min-h-screen bg-gray-100;

  h1 {
    @apply text-3xl font-bold mb-4;
  }

  button {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors;
  }
}
</style>
