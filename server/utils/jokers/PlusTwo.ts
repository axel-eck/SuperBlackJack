import type { JokerEffectHandler } from "#server/utils/players";

export const playPlusTwoEffect: JokerEffectHandler = async (gameId: GameId, _fromPlayer: PlayerId, toPlayer: PlayerId, toHandIndex: number)=> {
  const game = await useStorage<Game>('games').getItem(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const toPlayerIdx = game.players.findIndex(p => p.id === toPlayer)
  if (toPlayerIdx === -1) {
    throw new Error('Player not found in game')
  }
  game.players[toPlayerIdx]!.hands[toHandIndex]!.cards.push({
    color: 'joker',
    type: Jokers.PlusTwo,
  });
  await useStorage<Game>('games').set(gameId, game)
}
