import type { PlayerAction } from "#shared/types/ws/actions";
import type { GameId, GameState } from "#shared/types/game";
import type { PlayerId } from "#shared/types/player";
import type { Card } from "#shared/types/cards";

export interface IMessage {
  type: string,
  gameId: GameId,
  content?: unknown
}

export type PlayerTurnMessage = IMessage & {
  type: 'player-turn',
  content: {
    playerId: PlayerId
  }
}

export type PlayerActionMessage = IMessage & {
  type: 'player-action',
  content: {
    playerId: PlayerId,
    action: PlayerAction
  }
}

export type GameStateUpdateMessage = IMessage & {
  type: 'game-state-update',
  content: {
    newState: Exclude<GameState, 'ended'>
  } | {
    newState: 'ended',
    winnerId: PlayerId | null
  }
}

export type PlayerJoinMessage = IMessage & {
  type: 'player-join',
  content: {
    player: {
      id: PlayerId,
      name: string
    }
  }
}

export type PlayerLeaveMessage = IMessage & {
  type: 'player-leave',
  content: {
    playerId: PlayerId
  }
}

export type PlayerJoinRequestMessage = IMessage & {
  type: 'player-join-request',
  content: {
    player: {
      name: string
    }
  }
}

export type PlayerJoinRequestResponseMessage = (IMessage & {
  type: 'player-join-request-response',
  content: {
    success: true,
    playerId: PlayerId
    name: string
  }
}) | (IMessage & {
  type: 'player-join-request-response',
  content: {
    success: false,
    message: string
  }
})

export type ErrorMessage = IMessage & {
  type: 'error',
  content: {
    message: string
  }
}

export type NewGameOwnerMessage = IMessage & {
  type: 'new-game-owner',
  content: {
    playerId: PlayerId
  }
}

export type DealCardMessage = IMessage & {
  type: 'deal-card',
  content: {
    playerId: PlayerId,
    card: Card
  }
}

export type Message =
  | PlayerTurnMessage
  | PlayerActionMessage
  | GameStateUpdateMessage
  | PlayerJoinMessage
  | ErrorMessage
  | PlayerJoinRequestMessage
  | PlayerJoinRequestResponseMessage
  | PlayerLeaveMessage
  | NewGameOwnerMessage
  | DealCardMessage
