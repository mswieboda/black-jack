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
  get name() {
    return `${this.rank}${this.suit}`
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

export class Deck {
  constructor() {
    makeObservable(this)
  }

  @observable
  cards: Card[] = []

  static newStandardDeck = () => {
    const deck = new Deck()

    deck.cards = Card.standardCards()

    return deck
  }

  static newShoot = (decks: number) => {
    const deck = new Deck()

    _.times(decks, () => {
      deck.cards = deck.cards.concat(Card.standardCards())
    })

    return deck
  }

  @action.bound
  shuffle = () => {
    this.cards = _.shuffle(this.cards)
    return this.cards
  }
}
