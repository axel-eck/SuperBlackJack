export enum NormalCardColor {
  Hearts = 'hearts',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Spades = 'spades'
}

export type CardColor = NormalCardColor | 'joker'

export enum NormalCardType {
  Ace = 'ace',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'jack',
  Queen = 'queen',
  King = 'king',
}

export enum Jokers {
  DrawOne = 'draw_one',
  PlusTwo = 'plus_two',
}

export type CardType = NormalCardType | Jokers

export interface ICard {
  color: CardColor
  type: CardType
}

export type NormalCard = ICard & {
  color: NormalCardColor
  type: NormalCardType
}

export interface JokerCard extends ICard {
  color: 'joker'
  type: Jokers
}

export type Card = NormalCard | JokerCard

export const getSuit = (): NormalCardType[] => {
  return [
    NormalCardType.Ace, NormalCardType.Two, NormalCardType.Three, NormalCardType.Four, NormalCardType.Five,
    NormalCardType.Six, NormalCardType.Seven, NormalCardType.Eight, NormalCardType.Nine, NormalCardType.Ten,
    NormalCardType.Jack, NormalCardType.Queen, NormalCardType.King
  ]
}

export const multiplyArray = <T>(arr: T[], times: number): T[] => {
  const result: T[] = []
  for (let i = 0; i < times; i++) {
    result.push(...arr)
  }
  return result
}

const CARD_COUNT: Record<CardColor, CardType[]> = {
  [NormalCardColor.Hearts]: [
    ...multiplyArray(getSuit(), 2)
  ],
  [NormalCardColor.Diamonds]: [
    ...multiplyArray(getSuit(), 2)
  ],
  [NormalCardColor.Clubs]: [
    ...multiplyArray(getSuit(), 2)
  ],
  [NormalCardColor.Spades]: [
    ...multiplyArray(getSuit(), 2)
  ],
  ['joker']: [
    ...multiplyArray([Jokers.DrawOne], 5),
    ...multiplyArray([Jokers.PlusTwo], 2)
  ]
}

export const getAllCards = (): Card[] => {
  const cards: Card[] = []
  for (const color in CARD_COUNT) {
    const types = CARD_COUNT[color as CardColor]
    types.forEach(type => {
      if (color === 'joker') {
        cards.push({ color: 'joker', type: type as Jokers })
      } else {
        cards.push({ color: color as NormalCardColor, type: type as NormalCardType })
      }
    })
  }
  return cards
}

export const isJokerCard = (card: Card): card is JokerCard => {
  return card.color === 'joker'
}

export const isNormalCard = (card: Card): card is NormalCard => {
  return card.color !== 'joker'
}

export const isFaceCard = (card: Card | CardType) : boolean => {
  const type = typeof card === 'object' ? card.type : card
  return type === NormalCardType.Jack || type === NormalCardType.Queen || type === NormalCardType.King
}

export const getCardValue = (card: Card): number => {
  if (isJokerCard(card)) {
    return 0;
  }
  if (isFaceCard(card)) {
    return 10;
  }
  if (card.type === NormalCardType.Ace) {
    return 11;
  }
  return parseInt(card.type);
}
