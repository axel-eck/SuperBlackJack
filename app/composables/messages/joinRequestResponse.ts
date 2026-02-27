import type { PlayerJoinMessage, PlayerJoinRequestResponseMessage } from "#shared/types/ws/message";

export const onJoinRequestResponse = async (message: PlayerJoinRequestResponseMessage) => {
  if (message.content.success) {
    usePlayer().value = {
      id: message.content.playerId,
      name: message.content.name,
      inventory: [],
      hands: [],
      scoreModifier: 0,
      isPlayerTurn: false
    }

    const game = useGame()
    game.value = {
      id: message.gameId,
      name: '',
      players: [],
      state: 'waiting',
      ownerId: null,
      winnerId: null,
    }
    await fetchGameState(message.gameId)

    sendMessage({
      type: 'player-join',
      gameId: message.gameId,
      content: {
        player: {
          id: message.content.playerId,
          name: message.content.name
        }
      }
    } satisfies PlayerJoinMessage)
  }
}
