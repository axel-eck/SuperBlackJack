import type { Game } from "#shared/types/game";
import z from "zod";
import { createGame } from "#server/utils/game";

const createDtoSchema = z.object({
  name: z.string().min(1, 'Name is required')
})


export default defineEventHandler(async (event): Promise<{ gameId: GameId }> => {
  const result = await readValidatedBody(event, body => createDtoSchema.safeParse(body))

  if (!result.success) {
    throw createError({
      status: 400,
      message: result.error.issues.map(e => e.message).join(', ')
    })
  }

  const game = createGame(result.data.name);
  await useStorage<Game>('games').setItem<Game>(game.id, game);

  return {
    gameId: game.id
  }
})
