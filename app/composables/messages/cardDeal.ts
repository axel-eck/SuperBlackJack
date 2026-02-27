import type { DealCardMessage } from "#shared/types/ws/message";
import { usePlayer } from "~/composables/player";

export const onCardDeal = async (message: DealCardMessage) => {
  const player = usePlayer();

  if (!player.value) {
    console.warn('Received card deal message for a player that is not loaded');
    return;
  }

  if (message.content.playerId === player.value.id) {
    player.value.inventory.push(message.content.card);
  }
}
