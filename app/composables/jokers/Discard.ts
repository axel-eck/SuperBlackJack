import type { JokerHandler } from "~/composables/websocket";

export const playDiscardEffect: JokerHandler = async (_fromPlayer: PlayerId, toPlayer: PlayerId, _toHandIndex: number)=> {
  const player = usePlayer();
  if (!player.value) {
    console.error('Player not found for joker effect');
    return;
  }
  if (toPlayer !== player.value.id) return;

  const inventoryRandomCardIndex = Math.floor(Math.random() * player.value.inventory.length);
  discardCard(inventoryRandomCardIndex);
}
