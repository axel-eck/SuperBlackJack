import type { Message } from "#shared/types/ws/message";
import type { Peer } from "crossws";
import { onPlayerJoinMessage } from "#server/utils/ws/game/playerJoin";
import { onPlayerJoinRequest } from "#server/utils/ws/game/playerJoinRequest";
import { onPlayerAction } from "#server/utils/ws/game/playerAction";

export const gamesPeers = new Map<GameId, {
  playerId: PlayerId,
  playerName: string,
  peer: Peer
}[]>

export const broadcastToGame = (gameId: GameId, message: Message, peerToExclude?: Peer) => {
  const players = gamesPeers.get(gameId);
  if (players) {
    for (const { peer } of players) {
      if (peer === peerToExclude) continue;
      peer.send(JSON.stringify(message));
    }
  }
}

export const sendToPlayer = (gameId: GameId, playerId: PlayerId, message: Message) => {
  const players = gamesPeers.get(gameId);
  if (players) {
    const player = players.find(p => p.playerId === playerId);
    if (player) {
      player.peer.send(JSON.stringify(message));
    }
  }
}

export type MessageHandler<K extends Message['type']> = (message: Extract<Message, { type: K }>, peer: Peer) => Promise<void>;

const messageHandlers: Partial<{ [K in Message['type']]: MessageHandler<K> }> = {
  'player-join': onPlayerJoinMessage,
  'player-join-request': onPlayerJoinRequest,
  'player-action': onPlayerAction,
}

const onMessage = async (message: Message, peer: Peer) => {
  const handler = messageHandlers[message.type] as MessageHandler<Message['type']> | undefined;
  if (handler) {
    await handler(message, peer);
  }
}

export default defineWebSocketHandler({
  message(peer, rawMessage) {
    const message = rawMessage.json<Message>();
    onMessage(message, peer).then();
  },

  close(peer) {
    for (const [gameId, players] of gamesPeers.entries()) {
      const index = players.findIndex(p => p.peer === peer);
      if (index !== -1) {
        const player = players[index];
        if (!player) {
          return
        }
        players.splice(index, 1);
        if (players.length === 0) {
          gamesPeers.delete(gameId);
        }
        removePlayerFromGame(gameId, player.playerId).then();
        break;
      }
    }
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});

