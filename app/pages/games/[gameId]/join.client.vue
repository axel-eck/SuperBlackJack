<script setup lang="ts">
const { gameId } = useRoute().params

const name = ref('')

const { data: publicGame, pending } = useAsyncData<Game | null>(`game-${gameId}`, async () => {
  const { data } = await useFetch<Game>(`/api/games/${gameId}`, {
    params: {
      gameId,
    },
  })
  return data.value ?? null
})

const game = useGame()

watch(game, (newGame) => {
  if (newGame && newGame.id === gameId) {
    navigateTo('/games/' + gameId)
    return
  }
})

const join = async () => {
  if (!name.value) {
    alert('Please enter your name to join the game.')
    return
  }

  if (!publicGame.value) {
    alert('Game not found. Please check the game ID and try again.')
    return
  }

  joinGame(publicGame.value.id, name.value);
}

useGameWebSocket();
</script>

<template>
  <div v-if="publicGame" id="join-game">
    <h1>Join Game {{ publicGame.name }}</h1>
    <input
      v-model="name"
      type="text"
      placeholder="Enter your name"
    >
    <button @click="join">
      Join Game
    </button>
  </div>
  <div v-else-if="pending" id="loading">
    <p>Loading game data...</p>
  </div>
  <div v-else id="not-found">
    <p>Game not found.</p>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

#join-game {
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

#loading,
#not-found {
  @apply flex flex-col items-center justify-center min-h-screen bg-gray-100;
}

</style>
