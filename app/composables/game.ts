import type { PublicGameInfo } from "#shared/types/game";
import type { PlayerJoinRequestMessage } from "#shared/types/ws/message";

export const useGame = () => {
  return useState<PublicGameInfo | null>('game', () => null)
}

export const joinGame = (gameId: GameId, playerName: string) => {
  if (!gameId) {
    throw new Error('Game ID is required to join a game')
  }

  const gameWebSocket = useGameWebSocket()
  if (!gameWebSocket.value) {
    throw new Error('WebSocket connection is not established')
  }

  const joinMessage: PlayerJoinRequestMessage = {
    type: 'player-join-request',
    gameId,
    content: {
      player: {
        name: playerName
      }
    }
  }

  gameWebSocket.value.send(JSON.stringify(joinMessage))
}

export const fetchGameState = async (gameId: GameId) => {
  try {
    const response = await $fetch(`/api/games/${gameId}`);
    if (!response) {
      return;
    }
    const game = useGame()
    if (!game.value) {
      console.warn('Game state fetched but no game is loaded');
      return;
    }
    game.value.state = response.state;
    game.value.ownerId = response.ownerId as PlayerId | null;
  } catch (error) {
    console.error('Error fetching game state:', error);
  }
}
