import type { Card, Jokers } from "#shared/types/cards";
import type { PlayerId } from "#shared/types/player";

export interface IAction {
  type: string,
  payload?: unknown
}

export type PlayCardAction = IAction & {
  type: 'play-card',
  payload: {
    card: Card,
    cardIndex: number,
    handIndex: number
  }
}

export type SplitHandAction = IAction & {
  type: 'split-hand',
  payload: {
    handIndex: number
  }
}

export type DoubleDownAction = IAction & {
  type: 'double-down',
  payload: {
    handIndex: number
  }
}

export type PassAction = IAction & {
  type: 'pass',
}

export type PlayJokerAction = IAction & {
  type: 'play-joker',
  payload: {
    cardType: Jokers,
    from: {
      playerId: PlayerId,
      cardIndex: number
    },
    to: {
      playerId: PlayerId,
      handIndex: number
    }
  }
}

export type PlayerAction = PlayCardAction | SplitHandAction | DoubleDownAction | PassAction | PlayJokerAction;
