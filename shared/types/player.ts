import type { Card } from "./cards";
import type { Hand } from "#shared/types/hand";

export type PlayerId = string & { __brand: 'PlayerId' }

export type Player = {
  id: PlayerId;
  name: string;
  inventory: Card[];
  hands: Hand[];
  scoreModifier: number;
  isPlayerTurn: boolean;
}

export type PublicPlayerInfo = {
  id: PlayerId;
  name: string;
  hands: Hand[];
  scoreModifier: number;
  isPlayerTurn: boolean;
}
