import type { ErrorMessage, PlayerActionMessage } from "#shared/types/ws/message";
import type { Peer } from "crossws";
import { broadcastToGame, gamesPeers } from "#server/routes/ws/game";
import { getPlayerTurnId, nextTurn, passTurnForGame } from "#server/utils/game";
import { discardCard, getPlayableHandCount, playCard, playJoker, splitHand } from "#server/utils/players";

export const onPlayerAction = async (message: PlayerActionMessage, peer: Peer) => {
  if (gamesPeers.get(message.gameId)?.find(p => p.peer === peer)?.playerId !== message.content.playerId) {
    peer.send(JSON.stringify({
      type: 'error',
      gameId: message.gameId,
      content: {
        message: 'You are not authorized to perform this action (impersonation attempt)'
      }
    } satisfies ErrorMessage));
    return;
  }

  const playerTurn = await getPlayerTurnId(message.gameId);
  if (playerTurn !== message.content.playerId) {
    peer.send(JSON.stringify({
      type: 'error',
      gameId: message.gameId,
      content: {
        message: 'It is not your turn to perform an action'
      }
    } satisfies ErrorMessage));
    return;
  }

  broadcastToGame(message.gameId, message, message.content.action.type === 'play-joker' ? undefined : peer);

  switch (message.content.action.type) {
    case "play-card":
      await playCard(message.gameId, message.content.playerId, message.content.action.payload.cardIndex, message.content.action.payload.handIndex);
      if (await getPlayableHandCount(message.gameId, message.content.playerId) === 0) {
        await nextTurn(message.gameId);
      }
      break;
    case "discard-card":
      await discardCard(message.gameId, message.content.playerId, message.content.action.payload.cardIndex);
      break;
    case "pass":
      await passTurnForGame(message.gameId, message.content.playerId);
      break;
    case "play-joker":
      await playJoker(message.gameId, message.content.action.payload.from.playerId, message.content.action.payload.from.cardIndex, message.content.action.payload.to.playerId, message.content.action.payload.to.handIndex);
      break;
    case "split-hand":
      await splitHand(message.gameId, message.content.playerId, message.content.action.payload.handIndex);
      if (await getPlayableHandCount(message.gameId, message.content.playerId) === 0) {
        await nextTurn(message.gameId);
      }
      break;
    default:
      break;
  }
}
