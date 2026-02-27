import { useGame } from "~/composables/game";
import type { PlayJokerAction } from "#shared/types/ws/actions";

const jokerHandlers: Partial<Record<Jokers, JokerHandler>> = {

}

export const onPlayerAction: MessageHandler<'player-action'> = async (message) => {
  const { playerId, action } = message.content;

  const game = useGame();
  if (!game.value) {
    console.error('Game not found for player action', message.gameId);
    return;
  }

  const playerIdx = game.value.players.findIndex(p => p.id === playerId);
  if (playerIdx === -1) {
    console.error('Player not found for action', playerId, 'in game', message.gameId);
    return;
  }

  switch (action.type) {
    case 'play-card':
      game.value.players[playerIdx]!.hands[action.payload.handIndex]!.cards.push(action.payload.card);
      break;
    case 'split-hand': {
      const handToSplit = game.value.players[playerIdx]!.hands[action.payload.handIndex];
      if (!handToSplit) {
        console.warn('Invalid hand index for split:', action.payload.handIndex);
        return;
      }
      const newHand = {
        cards: handToSplit.cards.splice(1),
        canPlay: true
      };
      game.value.players[playerIdx]!.hands.push(newHand);
      break;
    }
    case 'play-joker': {
        const handler = jokerHandlers[action.payload.cardType];
        if (!handler) {
          console.warn('No handler for joker type:', action.payload.cardType);
          return;
        }
        handler(action.payload.from.playerId, action.payload.to.playerId, action.payload.to.handIndex);
      break;
    }
    default:
      break;
  }
}
