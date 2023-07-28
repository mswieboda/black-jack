import React, { Component } from 'react'
import { action, computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import {
  Button,
  InteractionManager,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import _ from 'lodash'
import { Hand, Shoot } from 'lib/cards'
import { showError, showInfo, showWarning } from 'lib/message'
import HandView from './hand-view'

const isDarkMode = true // Appearance.getColorScheme() === 'dark'
const INITIAL_TOTAL = 150
const ACTION_DELAY = 300
const BEFORE_PAYOUTS_DURATION = 1500
const AFTER_PAYOUTS_DURATION = 3500
const TESTING = false

const delayedAction = (act: () => void, duration: number = ACTION_DELAY) =>
  setTimeout(act, duration)

@observer
export default class BlackJack extends Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @observable
  shoot: Shoot = new Shoot()

  @observable
  discardShoot: Shoot = new Shoot()

  @observable
  playerHand: Hand = new Hand()

  @observable
  dealerHand: Hand = new Hand()

  @observable
  total: number = INITIAL_TOTAL

  @observable
  bet: number | null = null

  @observable
  turnIndex = 0

  @observable
  isDelayedActionPerforming = false

  componentDidMount() {
    InteractionManager.runAfterInteractions(this.afterInteractionSetup)
  }

  @action.bound
  afterInteractionSetup = () => {
    this.shoot.addDecks(8)
    this.shoot.shuffle()
  }

  @computed
  get hands() {
    return [this.playerHand, this.dealerHand]
  }

  @computed
  get hand() {
    return this.hands[this.turnIndex]
  }

  @computed
  get isDealerTurn() {
    return this.hand === this.dealerHand
  }

  @action.bound
  delayedAction = (act: () => void, duration: number = ACTION_DELAY) => {
    this.updateIsDelayedActionPerforming(true)
    InteractionManager.runAfterInteractions(() => {
      delayedAction(() => {
        act()
        this.updateIsDelayedActionPerforming(false)
      }, duration)
    })
  }

  @action.bound
  updateIsDelayedActionPerforming = (val: boolean) => {
    this.isDelayedActionPerforming = val
  }

  @action.bound
  clearHands = () => {
    this.turnIndex = 0
    this.hands.forEach(hand => {
      this.discardShoot.add(hand.cards)
      hand.clear()
    })
  }

  @action.bound
  hit = () => {
    this.hand.add(this.shoot.remove())
  }

  @action.bound
  onPressTest = () => {
    this.playerHand.add(this.shoot.remove())
    this.dealerHand.add(this.shoot.remove())
  }

  @action.bound
  onAddBet = (bet: number) => {
    this.bet += bet
    this.total -= bet
  }

  @action.bound
  onClearBet = () => {
    this.total += this.bet
    this.bet = null
  }

  @action.bound
  startDeal = () => {
    this.turnIndex = 0
    this.delayedAction(this.dealAction(0))
  }

  @action.bound
  nextTurnIndex = () => {
    const index = this.turnIndex + 1

    this.turnIndex = index > this.hands.length - 1 ? 0 : index
  }

  @action.bound
  dealAction = dealIndex => () => {
    this.hit()
    this.nextTurnIndex()

    if (!this.hand.isDealt) {
      this.delayedAction(this.dealAction(dealIndex + 1))
    } else if (this.hand === this.playerHand && this.hand.isBlackJack) {
      this.startNextTurn()
    }
  }

  @action.bound
  startNextTurn = () => {
    this.nextTurnIndex()

    if (this.isDealerTurn) {
      this.dealerPlayAction()
    }
  }

  dealerPlayAction = () => {
    // TODO: potentially add option to stay on soft 17
    if (!this.hand.isBust && this.hand.maxValue < 17) {
      this.delayedAction(() => {
        this.hit()
        this.dealerPlayAction()
      })
    } else {
      this.delayedAction(this.doPayouts, BEFORE_PAYOUTS_DURATION)
    }
  }

  @action.bound
  doLosePayout = () => {
    showError(`lost -${this.bet}`)
    this.bet = null
  }

  @action.bound
  doWinPayout = () => {
    // TODO: add setting to set blackjack payout, currently at 3/2 (1.5)
    const payout = this.bet * (this.playerHand.isBlackJack ? 1.5 : 1)
    showInfo(`won +${payout}`)
    this.total += payout
  }

  @action.bound
  doPayouts = () => {
    if (this.playerHand.isBust) {
      this.doLosePayout()
    } else if (this.dealerHand.isBust) {
      this.doWinPayout()
    } else if (this.playerHand.maxValue < this.dealerHand.maxValue) {
      this.doLosePayout()
    } else if (this.playerHand.maxValue > this.dealerHand.maxValue) {
      this.doWinPayout()
    } else {
      showWarning('push')
    }

    this.delayedAction(this.clearHands, AFTER_PAYOUTS_DURATION)
  }

  @action.bound
  onPressStay = () => {
    this.startNextTurn()
  }

  @action.bound
  onPressSplit = () => {
    showWarning('split not yet implemented')
  }

  @action.bound
  onPressDoubleDown = () => {
    showWarning('double down not yet implemented')
  }

  @action.bound
  onPressHit = () => {
    this.turnIndex = 0
    this.delayedAction(() => {
      this.hit()

      if (this.hand.isBust || this.hand.isTwentyOne) {
        this.delayedAction(this.startNextTurn)
      }
    })
  }

  render() {
    return (
      <View style={this.styles.container}>
        {TESTING && (
          <View style={this.styles.testRow}>
            <Button onPress={this.onPressTest} title="Test" />
            <Button onPress={this.clearHands} title="Reset" />
          </View>
        )}
        <HandView
          label="dealer"
          hand={this.dealerHand}
          isDealer={true}
          isDealerTurn={this.isDealerTurn}
        />
        <View style={this.styles.bottomView}>
          <HandView label="player" hand={this.playerHand} />
          <View style={this.styles.section}>
            {!_.isNil(this.bet) && <Bet bet={this.bet} />}
          </View>
          <Actions
            bet={this.bet}
            hand={this.playerHand}
            isLocked={this.isDelayedActionPerforming || this.isDealerTurn}
            onClearBet={this.onClearBet}
            onConfirmBet={this.startDeal}
            onPressStay={this.onPressStay}
            onPressSplit={this.onPressSplit}
            onPressDoubleDown={this.onPressDoubleDown}
            onPressHit={this.onPressHit}
          />
          <View style={this.styles.section}>
            <Chips
              isLocked={this.isDelayedActionPerforming}
              canBet={!this.playerHand.hasCards}
              total={this.total}
              onAddBet={this.onAddBet}
            />
          </View>
        </View>
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: isDarkMode ? '#131313' : '#f0f0f0',
        margin: 16,
        marginTop: 64,
      },
      section: {
        flex: 1,
      },
      bottomView: {
        flex: 2,
        justifyContent: 'flex-end',
      },
      testRow: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
      },
    })
  }
}

interface ActionsProps {
  bet?: number
  hand: Hand
  isLocked?: boolean
  onClearBet: () => void
  onConfirmBet: () => void
  onPressStay: () => void
  onPressSplit: () => void
  onPressDoubleDown: () => void
  onPressHit: () => void
}

@observer
class Actions extends Component<ActionsProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get bettingDisabled() {
    return this.props.isLocked || _.isNil(this.props.bet)
  }

  renderPreBet() {
    return (
      <>
        <View style={[this.styles.button, this.styles.buttonFirst]}>
          <Button
            onPress={this.props.onClearBet}
            title="Clear"
            disabled={this.bettingDisabled}
          />
        </View>
        <View style={[this.styles.button, this.styles.buttonLast]}>
          <Button
            onPress={this.props.onConfirmBet}
            title="Bet"
            disabled={this.bettingDisabled}
          />
        </View>
      </>
    )
  }

  renderHand() {
    return (
      <>
        <View style={[this.styles.button, this.styles.buttonFirst]}>
          <Button
            title="Stay"
            onPress={this.props.onPressStay}
            disabled={this.props.isLocked || !this.props.hand.canStay}
          />
        </View>
        <View style={this.styles.button}>
          <Button
            title="Split"
            onPress={this.props.onPressSplit}
            disabled={this.props.isLocked || !this.props.hand.canSplit}
          />
        </View>
        <View style={this.styles.button}>
          <Button
            title="Double"
            onPress={this.props.onPressDoubleDown}
            disabled={this.props.isLocked || !this.props.hand.canDoubleDown}
          />
        </View>
        <View style={[this.styles.button, this.styles.buttonLast]}>
          <Button
            title="Hit"
            onPress={this.props.onPressHit}
            disabled={this.props.isLocked || !this.props.hand.canHit}
          />
        </View>
      </>
    )
  }

  render() {
    return (
      <View style={this.styles.container}>
        {this.props.hand.hasCards ? this.renderHand() : this.renderPreBet()}
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
      },
      button: {
        flex: 1,
        paddingHorizontal: 8,
      },
      buttonFirst: {
        paddingLeft: 0,
      },
      buttonLast: {
        paddingRight: 0,
      },
    })
  }
}

interface ChipsProps {
  isLocked?: boolean
  canBet?: boolean
  total: number
  onAddBet: (bet: number) => void
}

const CHIP_DENOMINATIONS = [5, 10, 25, 50, 100, 500]

@observer
class Chips extends Component<ChipsProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  canBet = (bet: number) => {
    return this.props.total - bet >= 0
  }

  onAddBet = (bet: number) => () => this.props.onAddBet(bet)

  renderChips() {
    return (
      <View style={this.styles.chipsRow}>
        {CHIP_DENOMINATIONS.map((chip, index) => {
          const isLast = index === CHIP_DENOMINATIONS.length - 1
          const isFirst = index === 0
          const PADDING = 6
          const paddingLeft = isFirst ? 0 : PADDING
          const paddingRight = isLast ? 0 : PADDING
          const disabled = this.props.isLocked || !this.canBet(chip)

          return (
            <View
              style={[this.styles.container, { paddingLeft, paddingRight }]}
              key={`${chip}`}>
              <Button
                title={`${chip}`}
                onPress={this.onAddBet(chip)}
                disabled={disabled}
              />
            </View>
          )
        })}
      </View>
    )
  }

  renderTotals() {
    return (
      <View style={this.styles.total}>
        <Text style={this.styles.totalLabel}>Total: ${this.props.total}</Text>
      </View>
    )
  }

  render() {
    return (
      <View style={this.styles.container}>
        {this.props.canBet && this.renderChips()}
        {this.renderTotals()}
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        flex: 1,
      },
      chipsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
      },
      total: {
        flex: 1,
        justifyContent: 'flex-end',
      },
      totalLabel: {
        fontSize: 16,
      },
    })
  }
}

interface BetProps {
  bet: number
}

@observer
class Bet extends Component<BetProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  render() {
    return <Text style={this.styles.label}>bet: ${this.props.bet}</Text>
  }

  @computed
  get styles() {
    return StyleSheet.create({
      label: {
        fontSize: 16,
      },
    })
  }
}
