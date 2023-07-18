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
import HandView from './hand-view'

const isDarkMode = true // Appearance.getColorScheme() === 'dark'

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
  onPressHit = () => {
    this.playerHand.add(this.shoot.remove())
    this.dealerHand.add(this.shoot.remove())
  }

  render() {
    return (
      <View style={this.styles.container}>
        <View style={this.styles.section}>
          <HandView label="dealer" hand={this.dealerHand} />
        </View>
        <View style={this.styles.bottomView}>
          <View style={this.styles.section}>
            <HandView label="player" hand={this.playerHand} />
          </View>
          <View style={this.styles.section}>{/* Bet */}</View>
          <Actions hand={this.playerHand} />
          <View style={this.styles.section}>
            <Chips canBet={!this.playerHand.hasCards} total={300} />
          </View>
          <View style={this.styles.testRow}>
            <Button onPress={this.onPressHit} title="Hit" />
            <Button onPress={this.onPressHit} title="Reset" />
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
  hand: Hand
}

@observer
class Actions extends Component<ActionsProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  renderPreBet() {
    return (
      <>
        <Button onPress={_.noop} title="Clear" />
        <View style={this.styles.separator} />
        <Button onPress={_.noop} title="Bet" />
      </>
    )
  }

  renderHand() {
    return (
      <>
        <Button onPress={_.noop} title="Stay" />
        <View style={this.styles.separator} />
        {this.props.hand.canDoubleDown && (
          <>
            <Button onPress={_.noop} title="Double Down" />
            <View style={this.styles.separator} />
          </>
        )}
        {this.props.hand.canSplit && (
          <>
            <Button onPress={_.noop} title="Split" />
            <View style={this.styles.separator} />
          </>
        )}
        <Button onPress={this.onPressHit} title="Hit" />
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
        marginTop: 32,
      },
      separator: {
        width: 16,
      },
    })
  }
}

interface ChipsProps {
  canBet?: boolean
  total: number
}

const CHIP_DENOMINATIONS = [5, 10, 25, 50, 100, 250, 500]

@observer
class Chips extends Component<ChipsProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  renderChips() {
    return (
      <View style={this.styles.chipsRow}>
        {CHIP_DENOMINATIONS.map((chip, index) => {
          const useSeparator = index < CHIP_DENOMINATIONS.length + 1

          // TODO: search how to add key to blank <></> React component
          return (
            <>
              <Button onPress={_.noop} title={`${chip}`} />
              {useSeparator && <View style={this.styles.separator} />}
            </>
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
      separator: {
        width: 8,
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
