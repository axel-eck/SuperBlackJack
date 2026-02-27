import type { JokerHandler } from "~/composables/websocket";
import { Jokers } from "#shared/types/cards";

export const playPlusTwoEffect: JokerHandler = async (_fromPlayer: PlayerId, toPlayer: PlayerId, toHandIndex: number)=> {
  const game = useGame();
  const player = usePlayer();
  if (!game.value) {
    console.error('Game not found for joker effect');
    return;
  }
  if (!player.value) {
    console.error('Player not found for joker effect in game', game.value.id);
    return;
  }
  const playerIdx = game.value.players.findIndex(p => p.id === toPlayer);
  if (playerIdx === -1) {
    if (toPlayer === player.value.id) {
      player.value.hands[toHandIndex]!.cards.push({ type: Jokers.PlusTwo, color: 'joker' });
    } else {
      console.error('Player not found for joker effect', toPlayer, 'in game', game.value.id);
      return;
    }
  }

  game.value.players[playerIdx]!.hands[toHandIndex]!.cards.push({ type: Jokers.PlusTwo, color: 'joker' });
}
