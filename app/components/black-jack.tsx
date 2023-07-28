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
import { showError, showWarning } from 'lib/message'
import HandView from './hand-view'

const isDarkMode = true // Appearance.getColorScheme() === 'dark'
const INITIAL_TOTAL = 150
const ACTION_DELAY = 300
const TESTING = false

const delayedAction = (a: () => void) => setTimeout(a, ACTION_DELAY)

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

  @action.bound
  clearHands = () => {
    this.hands.forEach(hand => {
      this.discardShoot.add(hand.cards)
      hand.clear()
    })
  }

  @action.bound
  hit = () => {
    const hand = this.hands[this.turnIndex]

    hand.add(this.shoot.remove())

    if (hand.isBust) {
      showError(this.delaerHand === hand ? 'dealer ' : '' + 'bust!')
    }
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
    delayedAction(this.dealAction(0))
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

    const hand = this.hands[this.turnIndex]

    if (!hand.isDealt) {
      delayedAction(this.dealAction(dealIndex + 1))
    }
  }

  @action.bound
  onPressStay = () => {
    showWarning('stay not yet implemented')
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
    delayedAction(this.hit)
  }

  render() {
    return (
      <View style={this.styles.container}>
        <HandView
          label="dealer"
          hand={this.dealerHand}
          isDealer={true}
          isDealerTurn={false} // TODO: impl
        />
        <View style={this.styles.bottomView}>
          <HandView label="player" hand={this.playerHand} />
          <View style={this.styles.section}>
            {!_.isNil(this.bet) && <Bet bet={this.bet} />}
          </View>
          <Actions
            bet={this.bet}
            hand={this.playerHand}
            onClearBet={this.onClearBet}
            onConfirmBet={this.startDeal}
            onPressStay={this.onPressStay}
            onPressSplit={this.onPressSplit}
            onPressDoubleDown={this.onPressDoubleDown}
            onPressHit={this.onPressHit}
          />
          <View style={this.styles.section}>
            <Chips
              canBet={!this.playerHand.hasCards}
              total={this.total}
              onAddBet={this.onAddBet}
            />
          </View>
          {TESTING && (
            <View style={this.styles.testRow}>
              <Button onPress={this.onPressTest} title="Test" />
              <Button onPress={this.clearHands} title="Reset" />
            </View>
          )}
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
      },
      section: {
        flex: 1,
      },
      bottomView: {
        flex: 2,
        justifyContent: 'flex-end',
      },
      testRow: {
        flexDirection: 'row',
      },
    })
  }
}

interface ActionsProps {
  bet?: number
  hand: Hand
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
    return _.isNil(this.props.bet)
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
          <Button title="Stay" onPress={this.props.onPressStay} />
        </View>
        <View style={this.styles.button}>
          <Button
            title="Split"
            onPress={this.props.onPressSplit}
            disabled={!this.props.hand.canSplit}
          />
        </View>
        <View style={this.styles.button}>
          <Button
            title="Double"
            onPress={this.props.onPressDoubleDown}
            disabled={!this.props.hand.canDoubleDown}
          />
        </View>
        <View style={[this.styles.button, this.styles.buttonLast]}>
          <Button
            title="Hit"
            onPress={this.props.onPressHit}
            disabled={!this.props.hand.canHit}
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
          const disabled = !this.canBet(chip)

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
