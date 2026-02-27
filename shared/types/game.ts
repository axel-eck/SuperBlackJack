import type { Player, PlayerId, PublicPlayerInfo } from "./player";
import type { Card} from "./cards";

export type GameId = string & { __brand: 'GameId' }

export type GameState = 'waiting' | 'playing' | 'ended'

export const START_HAND_SIZE = 7;

export type Game = {
  id: GameId;
  name: string;
  players: Player[];
  deck: Card[];
  turnIndex: number;
  state: GameState;
  ownerId: PlayerId | null;
  someonePlaying: boolean;
  passCount: number;
  winnerId: PlayerId | null;
}

export type PublicGameInfo = {
  id: GameId;
  name: string;
  players: PublicPlayerInfo[];
  state: GameState;
  ownerId: PlayerId | null;
  winnerId: PlayerId | null;
}
