import type { Game } from "#shared/types/game";
import { startGame } from "#server/utils/game";


export default defineEventHandler(async (event) => {
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

  if (game.state === 'playing') {
    throw createError({
      status: 400,
      message: 'Cannot start a game that has already started'
    })
  }

  await useStorage<Game>('games').setItem<Game>(gameId, game);
  await startGame(game);

})
