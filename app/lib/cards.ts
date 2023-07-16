import { action, computed, makeObservable, observable } from 'mobx'
import _ from 'lodash'

const Rank = {
  Ace: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
  Six: 6,
  Seven: 7,
  Eight: 8,
  Nine: 9,
  Ten: 10,
  Jack: 11,
  Queen: 12,
  King: 13,
}

const Suit = {
  Clubs: '♣️',
  Diamonds: '♦️',
  Hearts: '♥️',
  Spades: '♠️',
}

export class Card {
  constructor(
    private readonly suit: string,
    private readonly rank: number
  ) {
    makeObservable(this)
  }

  @computed
  get rankName() {
    if (this.rank == 1 || this.rank > 10) {
      const rank = Object.entries(Rank).find(([key, value]) => value === this.rank)
      return rank?.[0]?.[0]
    }

    return this.rank
  }

  @computed
  get name() {
    return `${this.rankName}${this.suit}`
  }

  static standardCards = () => {
    const cards = []

    for (const suit_key of Object.keys(Suit)) {
      const suit = Suit[suit_key]

      for (const rank_key of Object.keys(Rank)) {
        const rank = Rank[rank_key]
        const card = new Card(suit, rank)

        cards.push(card)
      }
    }

    return cards
  }
}

export class Shoot {
  constructor() {
    makeObservable(this)
  }

  @observable
  cards: Card[] = []

  @action.bound
  addDecks = (decks: number) => {
    this.cards = _.flatten(_.times(decks, () => Card.standardCards()))
  }

  @action.bound
  shuffle = () => {
    this.cards = _.shuffle(this.cards)
    return this.cards
  }

  @action.bound
  add = (cards: Card[]) => {
    this.cards = this.cards.concat(cards)
  }

  @action.bound
  remove = (amount: number = 1) => {
    return this.cards.splice(-amount, amount)
  }
}
