import { type Card, getCardValue } from "#shared/types/cards";

export type Hand = {
  cards: Card[];
  canPlay: boolean;
}


export const getHandScore = (hand: Hand, modifier?: number): number => {
  let score = 0;
  let aceCount = 0;
  for (const card of hand.cards) {
    if (card.type === 'ace') {
      aceCount++;
    } else {
      score += getCardValue(card);
    }
  }
  for (let i = 0; i < aceCount; i++) {
    if (score + 11 <= 21) {
      score += 11;
    } else {
      score += 1;
    }
  }
  if (modifier) {
    score += modifier;
  }
  if (score > 21) {
    return -1; // Bust
  }
  return score;
}

export const computeHandsScore = (hands: Hand[]): number => {
  return hands.map(hand => getHandScore(hand))
    .map(s => s == -1 ? 0 : s).reduce((acc, score) => acc + score, 0);
}
