import type { PlayCardAction } from "#shared/types/ws/actions";
import type { PlayerActionMessage } from "#shared/types/ws/message";

export const usePlayer = () => {
  return useState<Player | null>('player', () => null)
}

export const playJoker = (cardIndex: number, toPlayerId: PlayerId, toHandIndex: number) => {
  const player = usePlayer();
  const game = useGame();
  if (!player.value) {
    throw new Error('Player is not set')
  }
  if (!game.value) {
    throw new Error('Game is not set')
  }
  if (!player.value.isPlayerTurn) {
    console.warn('It is not the player\'s turn')
    return
  }
  if (game.value.state !== 'playing') {
    console.warn('Game is not in playing state')
    return
  }
  let toPlayer = game.value.players.find(p => p.id === toPlayerId);
  if (!toPlayer) {
    if (toPlayerId === player.value.id) {
      toPlayer = player.value;
    } else {
      console.warn('Invalid target player ID:', toPlayerId)
      return
    }
  }
  if (toPlayer.hands.length <= toHandIndex) {
    console.warn('Invalid hand index for target player:', toHandIndex)
    return
  }

  const card = player.value.inventory[cardIndex]
  if (!card) {
    console.warn('Invalid card index:', cardIndex)
    return
  }
  if (!isJokerCard(card)) {
    console.warn('Invalid card type (not a joker):', card)
    return
  }

  sendMessage({
    type: 'player-action',
    gameId: game.value.id,
    content: {
      playerId: player.value.id,
      action: {
        type: 'play-joker',
        payload: {
          from: {
            playerId: player.value.id,
            cardIndex
          },
          to: {
            playerId: toPlayerId,
            handIndex: toHandIndex
          }
        }
      }
    }
  } satisfies PlayerActionMessage)

  player.value.inventory.splice(cardIndex, 1)
}

export const playCard = (cardIndex: number, toHandIndex: number) => {
  const player = usePlayer();
  const game = useGame();
  if (!player.value) {
    throw new Error('Player is not set')
  }
  if (!game.value) {
    throw new Error('Game is not set')
  }
  if (!player.value.isPlayerTurn) {
    console.warn('It is not the player\'s turn')
    return
  }
  if (game.value.state !== 'playing') {
    console.warn('Game is not in playing state')
    return
  }

  const card = player.value.inventory[cardIndex]
  if (!card) {
    console.warn('Invalid card index:', cardIndex)
    return
  }
  if (!isNormalCard(card)) {
    console.warn('Invalid card type:', card)
    return
  }
  if (player.value.hands.length <= toHandIndex) {
    console.warn('Invalid hand index:', toHandIndex)
    return
  }

  sendMessage({
    type: 'player-action',
    gameId: game.value.id,
    content: {
      playerId: player.value.id,
      action: {
        type: 'play-card',
        payload: {
          card,
          cardIndex,
          handIndex: toHandIndex
        }
      } satisfies PlayCardAction
    }
  } satisfies PlayerActionMessage)

  player.value.inventory.splice(cardIndex, 1)
  player.value.hands[toHandIndex]!.cards.push(card)
  player.value.hands[toHandIndex]!.canPlay = false;

  if (player.value.inventory.length === 0) {
    passTurn();
  }
}

export const passTurn = () => {
  const player = usePlayer();
  const game = useGame();
  if (!player.value) {
    throw new Error('Player is not set')
  }
  if (!game.value) {
    throw new Error('Game is not set')
  }
  if (!player.value.isPlayerTurn) {
    console.warn('It is not the player\'s turn')
    return
  }
  if (game.value.state !== 'playing') {
    console.warn('Game is not in playing state')
    return
  }

  sendMessage({
    type: 'player-action',
    gameId: game.value.id,
    content: {
      playerId: player.value.id,
      action: {
        type: 'pass'
      }
    }
  }satisfies PlayerActionMessage)
}

export const split = (handIndex: number) => {
  const player = usePlayer();
  const game = useGame();
  if (!player.value) {
    throw new Error('Player is not set')
  }
  if (!game.value) {
    throw new Error('Game is not set')
  }
  if (!player.value.isPlayerTurn) {
    console.warn('It is not the player\'s turn')
    return
  }
  if (game.value.state !== 'playing') {
    console.warn('Game is not in playing state')
    return
  }

  if (player.value.hands.length <= handIndex) {
    console.warn('Invalid hand index:', handIndex)
    return
  }
  const hand = player.value.hands[handIndex]
  if (!hand || !hand.canPlay) {
    console.warn('Hand cannot be split:', hand)
    return
  }
  if (hand.cards.length !== 2 || hand.cards[0]!.type !== hand.cards[1]!.type) {
    console.warn('Hand cannot be split:', hand)
    return
  }

  sendMessage({
    type: 'player-action',
    gameId: game.value.id,
    content: {
      playerId: player.value.id,
      action: {
        type: 'split-hand',
        payload: {
          handIndex
        }
      }
    }
  } satisfies PlayerActionMessage)

  player.value.hands.push({
    canPlay: true,
    cards: [hand.cards.pop()!]
  })
  hand.canPlay = true;
}
