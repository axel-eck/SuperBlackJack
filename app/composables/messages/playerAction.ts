import { useGame } from "~/composables/game";
import { playPlusTwoEffect } from "~/composables/jokers/PlusTwo";
import { playDiscardEffect } from "~/composables/jokers/Discard";

const jokerHandlers: Partial<Record<Jokers, JokerHandler>> = {
  [Jokers.PlusTwo]: playPlusTwoEffect,
  [Jokers.Discard]: playDiscardEffect,
}

export const onPlayerAction: MessageHandler<'player-action'> = async (message) => {
  const { playerId, action } = message.content;

  const game = useGame();
  if (!game.value) {
    console.error('Game not found for player action', message.gameId);
    return;
  }

  switch (action.type) {
    case 'play-card': {
      const playerIdx = game.value.players.findIndex(p => p.id === playerId);
      if (playerIdx === -1) {
        console.error('Player not found for action', playerId, 'in game', message.gameId);
        return;
      }
      game.value.players[playerIdx]!.hands[action.payload.handIndex]!.cards.push(action.payload.card);
      break;
    }
    case 'split-hand': {
      const playerIdx = game.value.players.findIndex(p => p.id === playerId);
      if (playerIdx === -1) {
        console.error('Player not found for action', playerId, 'in game', message.gameId);
        return;
      }
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
