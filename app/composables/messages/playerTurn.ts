import type { PlayerTurnMessage } from "#shared/types/ws/message";
import { usePlayer } from "~/composables/player";
import { getHandScore } from "#shared/types/hand";

export const onPlayerTurn = async (message: PlayerTurnMessage) => {
  const game = useGame();

  if (!game.value) {
    console.warn('Received player turn message but no game is currently loaded');
    return;
  }

  if (game.value.id !== message.gameId) {
    console.warn(`Received player turn message for game ${message.gameId} but current game is ${game.value.id}`);
    return;
  }

  const player = game.value.players.findIndex(p => p.id === message.content.playerId);
  if (player === -1) {
    const myPlayer = usePlayer();

    if (myPlayer.value?.id === message.content.playerId) {
      myPlayer.value.isPlayerTurn = true;
      myPlayer.value.hands.forEach((hand) => hand.canPlay = (getHandScore(hand) < 21 && getHandScore(hand) >= 0));

      game.value.players.forEach((p) => {
        p.isPlayerTurn = false;
      });
    } else if (myPlayer.value) {
      myPlayer.value.isPlayerTurn = false;
    }
    return;
  }

  game.value.players.forEach((p) => {
    p.isPlayerTurn = p.id === message.content.playerId;
  });

  const myPlayer = usePlayer();
  if (myPlayer.value) {
    myPlayer.value.isPlayerTurn = false;
  }
}
