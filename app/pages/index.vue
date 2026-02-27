<script setup lang="ts">
</script>

<template>
  <div class="w-screen h-screen">
    <h1>Welcome to the Game Lobby</h1>
    <button @click="navigateTo('/games/new')">
      Create New Game
    </button>
    <div id="rules">
      <strong>Game Rules:</strong>
      <ul>
        <li>Players starts with {{ START_HAND_SIZE }} cards.</li>
        <li>Each player takes turns and tries to make each hands come closer to 21 without going over.</li>
        <li>You can split a hand if it has two cards of the same value, creating two separate hands to play.</li>
        <li>An ace will automatically be counted as 11 unless it would cause the hand to bust, in which case it will be counted as 1.</li>
        <li>Player score is the sum of the hands. A busted hand counts as 0 points. The player with the highest score wins.</li>
        <li>You can discard any card you want.</li>
        <li>At the hand of one table round, each player will be given enough card to go back to: {{ START_HAND_SIZE }} cards.</li>
        <li>You can play has much joker you want in a turn.</li>
        <li>Each game is composed of two 52 cards and the jokers. Once the deck is empty no more card will be given to the players.</li>
        <li>If all players passes in a round the game ends.</li>
      </ul>
    </div>
    <div id="jokers">
      <strong>Jokers:</strong>
      <ul>
        <li><strong>Draw 1:</strong> Can make any player (you included) draw a new card. <i>5 per decks</i></li>
        <li><strong>+ 2:</strong> Acts like a 2 but you can add it to an opponent's hand and make it bust. <i>2 per decks</i></li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

div {
  @apply flex flex-col items-center justify-center bg-gray-100;

  h1 {
    @apply text-3xl font-bold mb-4;
  }

  button {
    @apply bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors;
  }

  #rules, #jokers {
    @apply mt-6 bg-white p-4 rounded shadow-md w-full max-w-lg h-fit;

    strong {
      @apply text-lg font-semibold mb-2;
    }

    ul {
      @apply list-disc pl-5;
    }
  }
}
</style>
