<script setup lang="ts">
const name = ref('')

const createGame = async () => {
  if (!name.value) {
    alert('Please enter the game name.')
    return
  }

  try {
    const result = await $fetch(`/api/games/create`, {
      method: 'POST',
      body: {
        name: name.value,
      },
    })
    if (result?.gameId) {
      await navigateTo(`/games/${result.gameId}/join`)
    } else {
      alert('Failed to create the game. Please try again.')
    }
  } catch (error) {
    console.error('Error creating game:', error)
  }
}
</script>

<template>
  <div id="create-game">
    <h1>Create a New Game</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Enter game name"
    >
    <button @click="createGame">
      Create Game
    </button>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

#create-game {
  @apply flex flex-col items-center justify-center min-h-screen bg-gray-100;

  h1 {
    @apply text-3xl font-bold mb-4;
  }

  input {
    @apply border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-sm;
  }

  button {
    @apply bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors;
  }
}
</style>
