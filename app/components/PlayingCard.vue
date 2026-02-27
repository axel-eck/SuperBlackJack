<script setup lang="ts">
const { card, size = 'default' } = defineProps<{
  card: Card
  size?: 'default' | 'small'
}>()

const icon: Record<CardColor, string> = {
  [NormalCardColor.Diamonds]: 'fa-solid fa-diamond',
  [NormalCardColor.Hearts]: 'fa-solid fa-heart',
  [NormalCardColor.Clubs]: 'fa-solid fa-club',
  [NormalCardColor.Spades]: 'fa-solid fa-spade',
  ['joker']: 'fa-solid fa-sparkle',
}

const names: Partial<Record<CardType, string>> = {
  [NormalCardType.Ace]: 'A',
  [NormalCardType.Jack]: 'J',
  [NormalCardType.Queen]: 'Q',
  [NormalCardType.King]: 'K',
  [Jokers.DrawOne]: 'Draw 1',
  [Jokers.PlusTwo]: '+2',
}
</script>

<template>
  <div class="card" :class="`card-${card.color} card-${size}`">
    <i id="top-left" class="card-color" :class="icon[card.color]"/>
    <div id="center">
      <span class="card-value">{{ names[card.type] || card.type }}</span>
    </div>
    <i id="bottom-right" class="card-color" :class="icon[card.color]"/>
  </div>
</template>

<style scoped lang="scss">
@reference "tailwindcss";

.card {
  @apply relative aspect-5/7 rounded-lg shadow-lg flex flex-col items-center justify-center text-black;
  @apply border border-gray-200;
  @apply bg-white;
  @apply select-none;

  &-small {
    @apply w-16;

    .card-value {
      @apply font-semibold;
    }

    .card-color {
      @apply text-xs;
    }
  }

  &-default {
    @apply w-24;

    .card-color {
      @apply text-xl;
    }

    .card-value {
      @apply text-2xl font-bold;
    }
  }

  &-joker {
    @apply bg-linear-to-br from-gray-300 to-gray-500;
  }

  &-diamonds,
  &-hearts {
    @apply text-red-500;
  }

  &-clubs,
  &-spades {
    @apply text-gray-800;
  }

  #top-left {
    @apply absolute top-2 left-2 flex items-center;
  }

  #bottom-right {
    @apply absolute bottom-2 right-2 flex items-center transform rotate-180;
  }
}
</style>
