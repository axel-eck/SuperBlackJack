import type { NewGameOwnerMessage } from "#shared/types/ws/message";
import { useGame } from "~/composables/game";

export const onNewOwner = async (message: NewGameOwnerMessage) => {
  const game = useGame();

  if (!game.value) {
    console.warn('Received player join message for a game that is not loaded');
    return;
  }

  game.value.ownerId = message.content.playerId;
}
