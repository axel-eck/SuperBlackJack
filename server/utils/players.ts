import { getGameById } from "#server/utils/game";
import { getHandScore } from "#shared/types/hand";
import { playDrawOneEffect } from "#server/utils/jokers/DrawOne";
import { isJokerCard } from "#shared/types/cards";
import { playPlusTwoEffect } from "#server/utils/jokers/PlusTwo";

export const playCard = async (gameId: GameId, playerId: PlayerId, cardIndex: number, toHandIndex: number) => {
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  if (game.players[game.turnIndex]?.id !== playerId) {
    throw new Error('It is not the player\'s turn')
  }
  if (game.state !== 'playing') {
    throw new Error('Game is not in playing state')
  }
  const card = player.inventory[cardIndex]
  if (!card) {
    throw new Error('Invalid card index')
  }
  if (player.hands.length <= toHandIndex) {
    throw new Error('Invalid hand index')
  }

  // Play the card
  player.inventory.splice(cardIndex, 1)
  player.hands[toHandIndex]!.cards.push(card)
  player.hands[toHandIndex]!.canPlay = false;
  game.passCount = 0;
  await useStorage<Game>('games').set(gameId, game)
}

export const getPlayableHandCount = async (gameId: GameId, playerId: PlayerId): Promise<number> => {
  const game = await useStorage<Game>('games').getItem(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  return player.hands.filter(hand => hand.canPlay).length;
}

export const splitHand = async (gameId: GameId, playerId: PlayerId, handIndex: number) => {
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  if (game.players[game.turnIndex]?.id !== playerId) {
    throw new Error('It is not the player\'s turn')
  }
  if (game.state !== 'playing') {
    throw new Error('Game is not in playing state')
  }
  const handToSplit = player.hands[handIndex];
  if (!handToSplit) {
    throw new Error('Invalid hand index')
  }
  if (handToSplit.cards.length !== 2) {
    throw new Error('Can only split hands with exactly 2 cards')
  }
  if (handToSplit.cards[0]!.type !== handToSplit.cards[1]!.type) {
    throw new Error('Can only split hands with two cards of the same rank')
  }
  const newHand = {
    canPlay: true,
    cards: [handToSplit.cards.pop()!],
  }
  player.hands.push(newHand);
  game.passCount = 0;
  await useStorage<Game>('games').set(gameId, game)
}

export const getBestPlayerHandScore = async (gameId: GameId, playerId: PlayerId, includeModifier: boolean = false): Promise<number> => {
  const game = await useStorage<Game>('games').getItem(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  return Math.max(...player.hands.map(hand => getHandScore(hand, includeModifier ? player.scoreModifier : 0)));
}

export const computePlayerScore = async (gameId: GameId, playerId: PlayerId): Promise<number> => {
  const game = await useStorage<Game>('games').getItem(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  return computeHandsScore(player.hands);
}

export type JokerEffectHandler = (gameId: GameId, fromPlayer: PlayerId, toPlayer: PlayerId, toHandIndex: number) => Promise<void>

const jokerEffectHandlers: Partial<Record<Jokers, JokerEffectHandler>> = {
  [Jokers.DrawOne]: playDrawOneEffect,
  [Jokers.PlusTwo]: playPlusTwoEffect
}

export const playJoker = async (gameId: GameId, fromPlayerId: PlayerId, cardIndex: number, toPlayerId: PlayerId, toHandIndex: number) => {
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const fromPlayer = game.players.find(p => p.id === fromPlayerId);
  if (!fromPlayer) {
    throw new Error('From player not found in game')
  }
  const toPlayer = game.players.find(p => p.id === toPlayerId);
  if (!toPlayer) {
    throw new Error('To player not found in game')
  }
  if (game.players[game.turnIndex]?.id !== fromPlayerId) {
    throw new Error('It is not the from player\'s turn')
  }
  if (game.state !== 'playing') {
    throw new Error('Game is not in playing state')
  }
  const card = fromPlayer.inventory[cardIndex]
  if (!card) {
    throw new Error('Invalid card index')
  }
  if (!isJokerCard(card)) {
    throw new Error('Selected card is not a joker')
  }
  if (toPlayer.hands.length <= toHandIndex) {
    throw new Error('Invalid hand index')
  }

  const jokerEffectHandler = jokerEffectHandlers[(card as JokerCard).type]
  if (!jokerEffectHandler) {
    console.warn('No handler for joker type:', (card as JokerCard).type)
  }

  // Play the joker card
  const fromPlayerIndex = game.players.findIndex(p => p.id === fromPlayerId);
  game.players[fromPlayerIndex]!.inventory.splice(cardIndex, 1)
  game.passCount = 0;
  await useStorage<Game>('games').set(gameId, game)
  if (jokerEffectHandler) {
    await jokerEffectHandler(gameId, fromPlayerId, toPlayerId, toHandIndex);
  }
}

export const discardCard = async (gameId: GameId, playerId: PlayerId, cardIndex: number) => {
  const game = await getGameById(gameId);
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in game')
  }
  if (game.state !== 'playing') {
    throw new Error('Game is not in playing state')
  }
  const card = player.inventory[cardIndex]
  if (!card) {
    throw new Error('Invalid card index')
  }

  // Discard the card
  player.inventory.splice(cardIndex, 1)
  game.passCount = 0;
  await useStorage<Game>('games').set(gameId, game)
}
