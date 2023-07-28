import { action, computed, makeObservable, observable } from 'mobx'
import _ from 'lodash'

const ACE_MAX_VALUE = 11
const FACE_VALUE = 10
const TWENTY_ONE_VALUE = 21
const BLACKJACK_PAYOUT_RATIO = 1.5 // (3/2 payout)
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
  get valueOptions(): number | [number, number] {
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
      } else if (option < TWENTY_ONE_VALUE) {
        aceOption = option
      }
    }

    return _.isNil(aceOption) ? value : [value, aceOption]
  }

  @computed
  get value(): number {
    return _.isArrayLikeObject(this.valueOptions)
      ? _.max(this.valueOptions)
      : this.valueOptions
  }

  @computed
  get isTwentyOne(): boolean {
    return this.value === TWENTY_ONE_VALUE
  }

  @computed
  get isBlackJack(): boolean {
    return this.cards.length === 2 && this.isTwentyOne
  }

  @computed
  get display(): string {
    if (this.valueOptions === 0) {
      return ''
    } else if (this.isBlackJack) {
      return 'blackjack!'
    }

    return _.isArrayLikeObject(this.valueOptions)
      ? this.valueOptions.join('/')
      : this.valueOptions.toString()
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
  get isDealt() {
    return this.cards.length === 2
  }

  @computed
  get canStay() {
    return !this.isBust && this.cards.length >= 2
  }

  @computed
  get canSplit() {
    return this.isDealt && this.cards[0].rank === this.cards[1].rank
  }

  @computed
  get canDoubleDown() {
    return this.isDealt && this.cards.length === 2 && !this.isBlackJack
  }

  @computed
  get canHit() {
    return !this.isBust && this.cards.length >= 2 && !this.isTwentyOne
  }

  @computed
  get hasCards() {
    return this.cards.length > 0
  }

  @computed
  get isBust() {
    return this.value > TWENTY_ONE_VALUE
  }
}

// TODO: can use with settings to set blackjack payout, currently at 3/2 (1.5)
export const calculatePayout = (
  bet: number,
  playerHand: Hand,
  dealerHand: Hand,
  blackjack_payout_ratio: number = BLACKJACK_PAYOUT_RATIO,
) => {
  if (playerHand.isBust) {
    return -bet
  }

  if (dealerHand.isBust) {
    return bet
  }

  if (playerHand.value < dealerHand.value) {
    return -bet
  }

  if (playerHand.value > dealerHand.value) {
    return bet * (playerHand.isBlackJack ? blackjack_payout_ratio : 1)
  }

  if (playerHand.isBlackJack && !dealerHand.isBlackJack) {
    return bet * (playerHand.isBlackJack ? blackjack_payout_ratio : 1)
  }

  if (dealerHand.isBlackJack) {
    return -bet
  }

  return 0
}

export const dealerShouldHit = (playerHand: Hand, dealerHand: Hand) => {
  // TODO: potentially add option to stay/hit on soft 17
  return !playerHand.isBust && !dealerHand.isBust && dealerHand.value < 17
}
