import { dealCardToPlayer } from "#server/utils/game";
import type { JokerEffectHandler } from "#server/utils/players";

export const playDrawOneEffect: JokerEffectHandler = async (gameId: GameId, _fromPlayer: PlayerId, toPlayer: PlayerId, _toHandIndex: number)=> {
  await dealCardToPlayer(gameId, toPlayer);
}
