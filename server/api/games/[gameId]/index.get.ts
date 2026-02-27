import type { Game, PublicGameInfo } from "#shared/types/game";
import type { PublicPlayerInfo } from "#shared/types/player";

export default defineEventHandler(async (event): Promise<PublicGameInfo> => {
  const gameId = getRouterParam(event, 'gameId')

  if (!gameId) {
    throw createError({
      status: 400,
      message: 'Game ID is required'
    })
  }

  const game = await useStorage<Game>('games').getItem<Game>(gameId);
  if (!game) {
    throw createError({
      status: 404,
      message: 'Game not found'
    })
  }

  return {
    id: game.id,
    name: game.name,
    players: game.players.map(p => ({
      id: p.id,
      name: p.name,
      hands: p.hands,
      scoreModifier: p.scoreModifier,
      isPlayerTurn: p.isPlayerTurn,
    } satisfies PublicPlayerInfo)),
    state: game.state,
    ownerId: game.ownerId,
    winnerId: game.winnerId,
  } satisfies PublicGameInfo;
})
