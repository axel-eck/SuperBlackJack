<script setup lang="ts">
</script>

<template>
  <div id="main">
    <h1>Welcome to the Game Lobby</h1>
    <button @click="navigateTo('/games/new')">
      Create New Game
    </button>
    <div id="content">
      <div id="rules">
        <h1>Rules</h1>
        <ul>
          <li>Players starts with {{ START_HAND_SIZE }} cards.</li>
          <li>Each player takes turns and tries to make each hands come closer to 21 without going over.</li>
          <li>You can split a hand if it has two cards of the same value, creating two separate hands to play.</li>
          <li>An ace will automatically be counted as 11 unless it would cause the hand to bust, in which case it will be counted as 1.</li>
          <li>Player score is the sum of the hands. A busted hand counts as 0 points. The player with the highest score wins.</li>
          <li>You can discard any card you want.</li>
          <li>At the hand of one table round, each player will be given enough card to go back to: {{ START_HAND_SIZE }} cards.</li>
          <li>You can play has much joker you want in a turn.</li>
          <li>Once the deck is empty no more card will be given to the players.</li>
          <li>If all players passes in a round the game ends.</li>
        </ul>
      </div>
      <div id="cards">
        <h1>Cards</h1>
        <div id="card-list">
          <PlayingCard v-for="(card, index) in getAllCards()" :key="index" :card="card"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

#main {
  @apply flex flex-col items-center justify-center min-h-screen bg-gray-100 pt-10;

  h1 {
    @apply text-4xl font-bold mb-6;
  }

  button {
    @apply bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors mb-8;
  }

  #content {
    @apply flex flex-col gap-8 w-full max-w-6xl;

    #rules, #jokers, #cards {
      @apply bg-white p-6 rounded shadow-md flex-1;
      @apply flex flex-col items-start;

      h1 {
        @apply text-2xl font-semibold mb-4;
      }

      ul {
        @apply list-disc pl-5 space-y-2;
      }
    }

    #cards {
      @apply flex flex-col items-start;

      #card-list {
        @apply relative flex flex-wrap gap-4;

        .card {
          @apply relative transition-transform duration-200 ease-in-out;

          &:hover {
            @apply transform scale-105;
          }
        }
      }
    }
  }
}
</style>
