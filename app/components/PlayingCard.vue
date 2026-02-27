<script setup lang="ts">
import { JOKER_DESCRIPTIONS, JOKER_REQUIREMENTS } from "#shared/types/cards";

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
  [Jokers.Discard]: 'Discard',
}
</script>

<template>
  <div class="card" :class="`card-${card.color} card-${size}`">
    <i id="top-left" class="card-color" :class="icon[card.color]"/>
    <div id="center">
      <span class="card-value">{{ names[card.type] || card.type }}</span>
    </div>
    <i id="bottom-right" class="card-color" :class="icon[card.color]"/>
    <div v-if="card.color === 'joker'" class="card-tooltip">
      <p class="font-semibold">{{ names[card.type] }}</p>
      <p>{{ JOKER_DESCRIPTIONS[card.type as Jokers] }}</p>
      <div class="requirements">
        <p class="font-semibold">Requirements:</p>
        <ul class="list-disc list-inside">
          <li v-if="JOKER_REQUIREMENTS[card.type].requierePlayer">Requires a target player.</li>
          <li v-if="JOKER_REQUIREMENTS[card.type].requiereHand">Requires a target hand.</li>
          <li v-if="JOKER_REQUIREMENTS[card.type].requiereCard">Requires a target card.</li>
          <li v-if="JOKER_REQUIREMENTS[card.type].canTargetSelf">Can be played on yourself.</li>
        </ul>
      </div>
    </div>
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
    @apply bg-white;

    .card-value {
      @apply text-lg font-extrabold text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-blue-500;
    }

    .card-color {
      @apply text-lg text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-blue-500;
    }

    .card-tooltip {
      @apply absolute bottom-full mb-2 w-48 p-3 bg-white border border-gray-300 rounded shadow-lg text-sm text-gray-700;
      @apply z-50;
      @apply opacity-0 invisible;
      @apply transition-opacity duration-200;

      .requirements {
        @apply mt-2;

        p {
          @apply font-semibold mb-1;
        }

        ul {
          @apply list-disc list-inside;
        }

      }
    }

    &:hover .card-tooltip {
      @apply opacity-100 visible;
    }
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
