import type {
  PlayerJoinRequestMessage,
  PlayerJoinRequestResponseMessage
} from "#shared/types/ws/message";
import type { Peer } from "crossws";

export const onPlayerJoinRequest = async (message: PlayerJoinRequestMessage, peer: Peer) => {
  const gameAcceptPlayers = await doesGameAllowJoining(message.gameId);
  if (gameAcceptPlayers) {
    const playerId = crypto.randomUUID() as PlayerId;
    peer.send(JSON.stringify({
      type: 'player-join-request-response',
      gameId: message.gameId,
      content: {
        success: true,
        playerId,
        name: message.content.player.name
      }
    } satisfies PlayerJoinRequestResponseMessage));
    addPlayerToGame(message.gameId, {
      id: playerId,
      name: message.content.player.name,
      hands: [],
      inventory: [],
      scoreModifier: 0,
      isPlayerTurn: false,
    }).then();
  } else {
    peer.send(JSON.stringify({
      type: 'player-join-request-response',
      gameId: message.gameId,
      content: {
        success: false,
        message: 'Game is not accepting new players'
      }
    } satisfies PlayerJoinRequestResponseMessage));
  }
}
