import { broadcastToGame, sendToPlayer } from "#server/routes/ws/game";
import type {
  DealCardMessage,
  GameStateUpdateMessage,
  PlayerLeaveMessage,
  PlayerTurnMessage
} from "#shared/types/ws/message";
import { getHandScore } from "#shared/types/hand";
import { computePlayerScore, getBestPlayerHandScore } from "#server/utils/players";
import { START_HAND_SIZE } from "#shared/types/game";

export const createGame = (name: string): Game => {
  return {
    id: crypto.randomUUID() as GameId,
    name,
    players: [],
    deck: [],
    turnIndex: 0,
    state: 'waiting',
    ownerId: null,
    someonePlaying: false,
    passCount: 0,
    winnerId: null,
  }
}

const shuffleCards = (game: Game) => {
  // Clear player cards
  game.players.forEach(player => player.inventory = [])

  // Fill the deck with all cards
  game.deck = getAllCards()

  // Shuffle the deck using Fisher-Yates algorithm
  for (let i = game.deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error They can't be undefined
    [game.deck[i], game.deck[j]] = [game.deck[j], game.deck[i]]
  }
}

const shufflePlayers = (game: Game) => {
  for (let i = game.players.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error They can't be undefined
    [game.players[i], game.players[j]] = [game.players[j], game.players[i]]
  }
}

export const drawCard = async (gameId: GameId): Promise<Card | null> => {
  const game = await useStorage<Game>('games').getItem(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  if (game.deck.length === 0) {
    return null;
  }
  const card = game.deck.pop();
  await useStorage<Game>('games').set(gameId, game)
  return card || null;
}

export const dealCardToPlayer = async (gameId: GameId, playerId: PlayerId) => {
  const card = await drawCard(gameId);
  const game = await useStorage<Game>('games').getItem(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  const playerIdx = game.players.findIndex(p => p.id === playerId)
  if (playerIdx === -1) {
    throw new Error('Player not found in game')
  }
  if (card) {
    game.players[playerIdx]!.inventory.push(card)
    await useStorage<Game>('games').set(gameId, game)
    sendToPlayer(gameId, playerId, {
      type: 'deal-card',
      gameId,
      content: {
        card,
        playerId
      }
    } satisfies DealCardMessage)
  }
}

export const startGame = async (game: Game) => {
  shuffleCards(game);
  shufflePlayers(game);

  game.state = 'playing';
  game.passCount = 0;
  broadcastToGame(game.id, {
    type: 'game-state-update',
    gameId: game.id,
    content: {
      newState: 'playing'
    }
  } satisfies GameStateUpdateMessage)
  await useStorage<Game>('games').set(game.id, game)

  for (const player of game.players) {
    for (let i = 0; i < START_HAND_SIZE; i++) {
      await dealCardToPlayer(game.id, player.id)
    }
  }

  game = await useStorage<Game>('games').getItem<Game>(game.id) as Game;

  for (const player of game.players) {
    player.hands = [{ cards: [], canPlay: true }] // Reset hands
  }

  await useStorage<Game>('games').set(game.id, game)


  // Call the first player's turn
  const currentPlayer = game.players[game.turnIndex]
  if (currentPlayer) {
    broadcastToGame(game.id, {
      type: 'player-turn',
      gameId: game.id,
      content: {
        playerId: currentPlayer.id
      }
    } satisfies PlayerTurnMessage)
  }
}

export const addPlayerToGame = async (gameId: GameId, player: Player) => {
  const game = await useStorage<Game>('games').get(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  if (game.state !== 'waiting') {
    throw new Error('Cannot join a game that has already started')
  }
  if (game.players.length === 0) {
    game.ownerId = player.id;
  }
  game.players.push(player)
  await useStorage<Game>('games').set(gameId, game)
}

export const removePlayerFromGame = async (gameId: GameId, playerId: PlayerId) => {
  const game = await useStorage<Game>('games').get(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  console.log('Removing player', playerId, 'from game', gameId)
  const playerIndex = game.players.findIndex(p => p.id === playerId)
  if (playerIndex === -1) {
    throw new Error('Player not found in game')
  }
  game.players.splice(playerIndex, 1)
  if (game.ownerId === playerId) {
    // TODO Assign a new owner if the current owner leaves
  }
  await useStorage<Game>('games').set(gameId, game)
  broadcastToGame(gameId, {
    type: 'player-leave',
    content: {
      playerId,
    },
    gameId: gameId,
  } satisfies PlayerLeaveMessage)
}

export const doesGameAllowJoining = async (gameId: GameId) => {
  const game = await useStorage<Game>('games').get(gameId)
  if (!game) {
    return false
  }
  return game.state === 'waiting'
}

export const getPlayerTurnId = async (gameId: GameId): Promise<PlayerId | null> => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  if (!game) {
    return null
  }
  const currentPlayer = game.players[game.turnIndex]
  return currentPlayer ? currentPlayer.id : null
}

export const getGameById = async (gameId: GameId): Promise<Game | null> => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  return game || null
}

export const canPlayerPlay = async (gameId: GameId, playerId: PlayerId): Promise<boolean> => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId)
  if (!player) {
    throw new Error('Player not found in game')
  }
  const handsBelow21 = player.hands.filter(hand => (getHandScore(hand) < 21 && getHandScore(hand) >= 0)).length
  return handsBelow21 > 0;
}

export const stopGame = async (gameId: GameId) => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  game.state = 'ended';
  await useStorage<Game>('games').set(gameId, game)

  const comparablePlayers = await Promise.all(game.players.map(async (player) => {
    return {
      player,
      score: await computePlayerScore(gameId, player.id, true)
    }
  }));
  const winner = comparablePlayers.sort((a, b) => b.score - a.score)[0];

  broadcastToGame(game.id, {
    type: 'game-state-update',
    gameId: game.id,
    content: {
      newState: 'ended',
      winnerId: winner?.player.id || null,
    }
  } satisfies GameStateUpdateMessage)
}

export const nextTurn = async (gameId: GameId) => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  let currentPlayer: Player | null;
  let iterations = 0;
  do {
    if (iterations >= game.players.length) {
      // All players have been checked and none can play, end the round
      await stopGame(gameId);
      return;
    }
    game.turnIndex = (game.turnIndex + 1) % game.players.length
    await useStorage<Game>('games').set(gameId, game)

    currentPlayer = game.players[game.turnIndex] ?? null
    iterations++;
  } while (currentPlayer && !await canPlayerPlay(gameId, currentPlayer.id))
  if (currentPlayer) {
    game.players.forEach((p, index) => {
      p.isPlayerTurn = index === game.turnIndex;
    })
    game.players[game.turnIndex]?.hands.forEach((hand) => {
      hand.canPlay = (getHandScore(hand) < 21 && getHandScore(hand) >= 0);
    })

    await useStorage<Game>('games').set(gameId, game)
    broadcastToGame(game.id, {
      type: 'player-turn',
      gameId: game.id,
      content: {
        playerId: currentPlayer.id
      }
    } satisfies PlayerTurnMessage)
  }
}

export const passTurnForGame = async (gameId: GameId, playerId: PlayerId) => {
  const game = await useStorage<Game>('games').getItem<Game>(gameId)
  if (!game) {
    throw new Error('Game not found')
  }
  const player = game.players.find(p => p.id === playerId)
  if (!player) {
    throw new Error('Player not found in game')
  }
  player.hands.forEach(hand => hand.canPlay = false);
  game.passCount++;
  await useStorage<Game>('games').set(gameId, game)
  if (game.passCount >= game.players.length) {
    // All players have passed, end the round
    await stopGame(gameId);
    return;
  }
  await nextTurn(gameId);
}


