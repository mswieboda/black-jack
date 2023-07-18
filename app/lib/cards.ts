import { action, computed, makeObservable, observable } from 'mobx'
import _ from 'lodash'

const ACE_MAX_VALUE = 11
const FACE_VALUE = 10
const TWENTY_ONE_VALUE = 21
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
    private readonly rank: number,
    private readonly deckIndex: number,
  ) {
    makeObservable(this)
  }

  @computed
  get rankName() {
    if (this.rank === 1 || this.rank > 10) {
      const ranks = Object.entries(Rank)
      const rank = ranks.find(([_key, value]) => value === this.rank)
      return rank?.[0]?.[0]
    }

    return this.rank
  }

  @computed
  get name() {
    return `${this.rankName}${this.suit}`
  }

  @computed
  get key() {
    return `${this.name}-${this.deckIndex}`
  }

  static standardCards = (deckIndex: number = 0) => {
    const cards = []

    for (const suit_key of Object.keys(Suit)) {
      const suit = Suit[suit_key]

      for (const rank_key of Object.keys(Rank)) {
        const rank = Rank[rank_key]
        const card = new Card(suit, rank, deckIndex)

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
    this.cards = _.flatten(
      _.times(decks, deckIndex => Card.standardCards(deckIndex)),
    )
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

export class Hand {
  constructor(cards: Card[] = []) {
    makeObservable(this)
    this.cards = cards
  }

  @observable
  private readonly cards: Card[] = []

  @computed
  get value(): number | [number, number] {
    let ace = null
    let aceOption = null
    let value = 0

    for (const card of this.cards) {
      if (_.isNil(ace) && card.rank === Rank.Ace) {
        ace = card
      }

      if (card.rank <= 10) {
        value += card.rank
      } else {
        value += FACE_VALUE
      }
    }

    if (!_.isNil(ace)) {
      const option = value - ace.rank + ACE_MAX_VALUE

      if (option === TWENTY_ONE_VALUE) {
        return TWENTY_ONE_VALUE
      } else if (option < TWENTY_ONE_VALUE - ACE_MAX_VALUE) {
        aceOption = option
      }
    }

    return _.isNil(aceOption) ? value : [value, aceOption]
  }

  @computed
  get display(): string {
    if (this.value === 0) {
      return ''
    } else if (this.value === TWENTY_ONE_VALUE && this.cards.length === 2) {
      return 'blackjack!'
    }

    return _.isArrayLikeObject(this.value)
      ? this.value.join('/')
      : this.value.toString()
  }

  @action.bound
  clear() {
    this.cards.length = 0
  }

  @action.bound
  add(cards: Card[]) {
    this.cards.splice(this.cards.length, 0, ...cards)
  }

  @computed
  get canSplit() {
    if (this.cards.length !== 2) {
      return false
    }

    return this.cards[0].rank === this.cards[1].rank
  }

  @computed
  get canDoubleDown() {
    return this.cards.length === 2 && this.value !== TWENTY_ONE_VALUE
  }

  @computed
  get hasCards() {
    return this.cards.length > 0
  }
}
