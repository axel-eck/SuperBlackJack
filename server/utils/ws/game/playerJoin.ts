import type { ErrorMessage, Message, PlayerJoinMessage } from "#shared/types/ws/message";
import type { Peer } from "crossws";
import { broadcastToGame, gamesPeers } from "#server/routes/ws/game";

export const onPlayerJoinMessage = async (message: PlayerJoinMessage, peer: Peer) => {
  const gameId = message.gameId;
  const playerId = message.content.player.id;
  if (!gamesPeers.has(gameId)) {
    gamesPeers.set(gameId, []);
  }
  if (gamesPeers.get(gameId)?.some(p => p.playerId === playerId)) {
    peer.send(JSON.stringify({
      type: 'error',
      gameId,
      content: {
        message: 'Player ID already in use in this game'
      }
    } as ErrorMessage));
    return;
  }
  broadcastToGame(message.gameId, message, peer);
  for (const otherPlayer of gamesPeers.get(gameId) ?? []) {
    peer.send(JSON.stringify({
      type: 'player-join',
      gameId,
      content: {
        player: {
          id: otherPlayer.playerId,
          name: otherPlayer.playerName
        }
      }
    } as Message));
  }
  gamesPeers.get(gameId)?.push({ playerId, peer, playerName: message.content.player.name });
}
