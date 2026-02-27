import type { GameStateUpdateMessage } from "#shared/types/ws/message";
import { useGame } from "~/composables/game";
import { usePlayer } from "~/composables/player";

export const onGameStateUpdate = async (message: GameStateUpdateMessage)=> {
  const game = useGame()

  if (!game.value) {
    console.warn('Received game state update message but no game is currently loaded')
    return
  }

  if (game.value.id !== message.gameId) {
    console.warn(`Received game state update for game ${message.gameId} but current game is ${game.value.id}`)
    return
  }

  game.value.state = message.content.newState;

  if (message.content.newState === 'playing') {
    game.value.players.forEach((value) => {
      value.hands = [{
        cards: [],
        canPlay: true
      }];
    })

    const player = usePlayer();
    if (player.value) {
      player.value.hands = [{
        cards: [],
        canPlay: true
      }]

      player.value.inventory = [];
    }

    game.value.winnerId = null;
  } else if (message.content.newState === 'ended') {
    game.value.winnerId = message.content.winnerId;
  }
}
