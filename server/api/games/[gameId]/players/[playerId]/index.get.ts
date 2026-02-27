import type { Game } from "#shared/types/game";
import type { Player, PublicPlayerInfo } from "#shared/types/player";

export default defineEventHandler(async (event): Promise<PublicPlayerInfo> => {
  const gameId = getRouterParam(event, 'gameId')
  const playerId = getRouterParam(event, 'playerId')

  if (!gameId || !playerId) {
    throw createError({
      status: 400,
      message: 'Game ID and Player ID are required'
    })
  }

  const game = await useStorage<Game>('games').getItem<Game>(gameId);
  if (!game) {
    throw createError({
      status: 404,
      message: 'Game not found'
    })
  }

  const player = game.players.find((p: Player) => p.id === playerId);
  if (!player) {
    throw createError({
      status: 404,
      message: 'Player not found in this game'
    })
  }

  return {
    id: player.id,
    name: player.name,
    hands: player.hands,
    scoreModifier: player.scoreModifier,
    isPlayerTurn: player.isPlayerTurn,
  } satisfies PublicPlayerInfo;
})
