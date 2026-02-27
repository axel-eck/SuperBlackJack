<script setup lang="ts">
import PlayingCard from "~/components/PlayingCard.vue";
import { useGame } from "~/composables/game";
import { computeHandsScore } from "#shared/types/hand";
import { discardCard } from "~/composables/player";

const game = useGame();
const player = usePlayer();

const start = async () => {
  try {
    $fetch(`/api/games/${game.value?.id}/start`, {
      method: 'POST',
    }).catch((error) => {
      console.error('Error starting game:', error)
    })
  } catch (error) {
    console.error('Error starting game:', error)
  }
}

const cardSelected = ref<number | null>(null);

const waitingForHandSelection = ref<boolean>(false);

const waitingForPlayerSelection = ref<boolean>(false);

const waitingForOpponentHandSelection = ref<boolean>(false);

const selectedPlayerId = ref<PlayerId | null>(null);

const handSelectedCallback = ref<((handIndex: number) => void) | null>(null);

const submitPlayCard = (idx: number) => {
  if (!player.value) return;
  if (!player.value.isPlayerTurn) return;
  if (cardSelected.value === null) return;

  playCard(cardSelected.value, idx);
  cancelSelection();
}

const splitHand = (handIdx: number) => {
  if (!player.value) return;
  if (!player.value.isPlayerTurn) return;

  split(handIdx);
  cancelSelection();
}

const wantToSplit = () => {
  if (!player.value) return;
  if (!player.value.isPlayerTurn) return;

  waitingForHandSelection.value = true;
  handSelectedCallback.value = splitHand;
}

const submitJoker = (handIdx: number) => {
  if (!player.value) return;
  if (!player.value.isPlayerTurn) return;
  if (selectedPlayerId.value === null) return;
  if (cardSelected.value === null) return;

  playJoker(cardSelected.value, selectedPlayerId.value, handIdx);
  cancelSelection();
}

const cancelSelection = () => {
  waitingForHandSelection.value = false;
  handSelectedCallback.value = null;
  cardSelected.value = null;
  waitingForPlayerSelection.value = false;
  waitingForOpponentHandSelection.value = false;
  selectedPlayerId.value = null;
}
</script>

<template>
  <div v-if="player && game" id="game">
    <span id="score">
      Score: {{ computeHandsScore(player.hands) }}
    </span>
    <div v-if="game.ownerId === player.id">
      <button v-if="game.state !== 'playing'" id="start-button" @click="start">
        Start Game
      </button>
    </div>
    <span v-if="player.isPlayerTurn && game.state === 'playing'" id="your-turn" class="title">
      It's your turn!
    </span>
    <span v-if="game.state === 'ended'" id="game-ended" class="title">
      Game Ended
    </span>
    <span v-if="game.state === 'ended'" id ="winner" class="sub-title">
      Winner: {{ game.players.find(p => p.id === game!.winnerId)?.name ?? 'You' }}
    </span>
    <div id="players">
      <div
          v-for="p in game.players.filter(pp => pp.id !== player!.id)"
          :key="p.id"
          class="player"
          :class="{
            'current-turn': p.isPlayerTurn && game.state === 'playing',
            'winner': game.state === 'ended' && p.id === game.winnerId,
            'wait-selection': waitingForPlayerSelection && game.state === 'playing',
            'cursor-pointer': waitingForPlayerSelection && game.state === 'playing',
          }"
          @click="() => {
            if (waitingForPlayerSelection && game?.state === 'playing') {
              selectedPlayerId = p.id;
              waitingForPlayerSelection = false;
              waitingForOpponentHandSelection = true;
            }
          }"
      >
        <span class="player-score"> Score: {{ computeHandsScore(p.hands) }}</span>
        <p>{{ p.name }}</p>
        <div class="player-hands">
          <div
              v-for="(hand, index) in p.hands"
              :key="index"
              class="player-hand"
              :class="{
                'wait-selection': waitingForOpponentHandSelection && selectedPlayerId === p.id && hand.canPlay,
                'cursor-pointer': waitingForOpponentHandSelection && selectedPlayerId === p.id && hand.canPlay,
              }"
              @click="() => {
                if (waitingForOpponentHandSelection && selectedPlayerId === p.id) {
                  submitJoker(index);
                }
              }"
          >
            <PlayingCard v-for="(card, cardIndex) in hand.cards" :key="cardIndex" :card="card" :size="'small'"/>
          </div>
        </div>
      </div>
    </div>
    <div id="hands" :class="player.isPlayerTurn && game.state === 'playing' ? 'upper' : ''">
      <div
          v-for="(hand, index) in player.hands"
          :key="index"
          class="hand" :class="((waitingForHandSelection && hand.canPlay) || (waitingForOpponentHandSelection && selectedPlayerId === player.id)) ? 'wait-selection' : ''"
          @click="() => {
            if (waitingForOpponentHandSelection && game?.state === 'playing') {
              submitJoker(index);
            } else if (player!.isPlayerTurn && waitingForHandSelection !== null && hand.canPlay) {
              if (handSelectedCallback) {
                handSelectedCallback(index);
              }
            }
          }"
      >
        <PlayingCard v-for="(card, cardIndex) in hand.cards" :key="cardIndex" :card="card" />
      </div>
    </div>
    <div v-if="player.isPlayerTurn && game.state === 'playing'" id="controls">
      <button
          id="cancel"
          @click="() => cancelSelection()"
      >
        <i class="fas fa-times"/>
        <span>Cancel</span>
      </button>
      <button
          id="pass"
          @click="() => {
            cancelSelection();
            passTurn();
          }"
      >
        <i class="fas fa-undo-alt"/>
        <span>Pass</span>
      </button>
      <button id="split" @click="() => wantToSplit()">
        <i class="fas fa-clone"/>
        <span>Split</span>
      </button>
      <button
          v-if="waitingForPlayerSelection && game.state === 'playing'"
          id="select-self"
          @click="() => {
            selectedPlayerId = player!.id;
            waitingForPlayerSelection = false;
            waitingForOpponentHandSelection = true;
          }"
      >
        <i class="fas fa-user"/>
        <span>Select self</span>
      </button>
      <button
        v-if="cardSelected !== null && player.isPlayerTurn && game.state === 'playing'"
        id="discard-card"
        @click="() => {
          discardCard(cardSelected!);
          cancelSelection();
        }"
      >
        <i class="fas fa-trash"/>
        <span>Discard Card</span>
      </button>
    </div>
    <div id="inventory">
      <PlayingCard
          v-for="(card, index) in player.inventory"
          :key="index"
          :card="card"
          :class="index === cardSelected ? 'card-selected' : ''"
          @click="() => {
            if (player!.isPlayerTurn && game!.state === 'playing') {
              cardSelected = index;

              if (card.color !== 'joker') {
                waitingForHandSelection = true;
                handSelectedCallback = submitPlayCard;
              } else {
                waitingForPlayerSelection = true;
              }
            }
          }"
      />
    </div>
  </div>
  <div v-else>
    <p>Player or Game not found.</p>
  </div>
</template>

<style lang="scss" scoped>
@reference "tailwindcss";

#game {
  @apply relative w-screen h-screen;

  #score {
    @apply absolute top-4 left-4 text-lg font-semibold;
    @apply text-gray-700;
  }

  #start-button {
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded transition-colors;
    @apply cursor-pointer;
    @apply z-20;

    &:hover {
      @apply bg-green-600;
    }
  }

  #inventory {
    @apply w-fit;
    @apply absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4 flex gap-2;

    .card {
      @apply transition-transform duration-200 ease-in-out cursor-pointer;

      &:hover {
        @apply transform scale-110;
      }

      &.card-selected {
        @apply ring-2 ring-blue-500;
      }
    }
  }

  #hands {
    @apply absolute left-1/2 transform -translate-x-1/2;
    @apply flex gap-4;
    @apply flex-wrap justify-center items-end;
    @apply w-full max-w-4xl;
    @apply transition-all duration-200 ease-in-out;

    &.upper {
      @apply bottom-1/4;
    }

    &:not(.upper) {
      @apply bottom-1/5;
    }

    .hand {
      @apply relative w-24 min-h-32 rounded-lg bg-gray-200 flex flex-col items-center justify-center z-0;
      @apply -space-y-14;
      @apply h-fit;

      .card {
        @apply relative z-10;
      }

      &.wait-selection {
        @apply ring-2 ring-yellow-500 cursor-pointer;
      }

      &:not(.wait-selection) {
        @apply cursor-not-allowed;
      }
    }
  }

  #players {
    // Make a half circle of players around the center
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
    @apply flex gap-4;
    @apply flex-wrap justify-center;
    @apply w-full max-w-4xl;

    @for $i from 1 through 6 {
      .player:nth-child(#{$i}) {
        @apply absolute;
        @apply transform -translate-x-1/2 -translate-y-1/2;
        top: calc(50% - 150px * sin((#{$i} - 1) * 30deg));
        left: calc(50% + 150px * cos((#{$i} - 1) * 30deg));
      }
    }

    .player {
      @apply flex flex-col-reverse items-center justify-start gap-2;

      &.current-turn {
        @apply ring-2 ring-offset-2 ring-green-500;
      }


      &.winner {
        @apply ring-2 ring-offset-2 ring-green-500 animate-bounce;
      }

      &.wait-selection {
        @apply ring-2 ring-offset-2 ring-yellow-500;
      }

      .player-hands {
        @apply flex gap-2 justify-center items-end;

        .player-hand {
          @apply flex flex-col items-center;
          @apply -space-y-10;
          @apply min-h-16 w-16 rounded-lg bg-gray-200 h-fit;

          &.wait-selection {
            @apply ring-2 ring-yellow-500 cursor-pointer;
          }

          .card {
            @apply relative z-10;
          }
        }
      }
    }
  }

  #controls {
    @apply absolute bottom-1/6 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
    @apply flex gap-4;

    button {
      @apply bg-gray-300 text-gray-700 px-4 py-2 rounded transition-colors;
      @apply flex items-center gap-2;
      @apply cursor-pointer;
      @apply text-nowrap;

      &:hover {
        @apply bg-gray-400;
      }

      &#cancel {
        @apply bg-red-500 text-white;

        &:hover {
          @apply bg-red-600;
        }
      }

      &#pass {
        @apply bg-yellow-500 text-white;

        &:hover {
          @apply bg-yellow-600;
        }
      }

      &#split {
        @apply bg-blue-500 text-white;

        &:hover {
          @apply bg-blue-600;
        }
        }
    }
  }

  .title {
    @apply absolute top-4 left-1/2 transform -translate-x-1/2 text-xl font-bold;

    &#your-turn {
      @apply text-green-500;
    }

    &#game-ended {
      @apply text-red-500;
    }
  }

  .sub-title {
    @apply absolute top-12 left-1/2 transform -translate-x-1/2 text-lg font-semibold;
    @apply text-gray-700;
  }
}
</style>
