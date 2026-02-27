import type { PlayerJoinMessage } from "#shared/types/ws/message";
import { useGame } from "~/composables/game";

export const onPlayerJoin = async (message: PlayerJoinMessage) => {
  const game = useGame();

  if (!game.value) {
    console.warn('Received player join message for a game that is not loaded');
    return;
  }

  game.value.players.push({
    id: message.content.player.id,
    name: message.content.player.name,
    hands: [],
    scoreModifier: 0,
    isPlayerTurn: false,
  } satisfies PublicPlayerInfo)
}
