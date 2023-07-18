import React, { Component } from 'react'
import { action, computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, InteractionManager, StyleSheet, View } from 'react-native'
import _ from 'lodash'
import { Card, Shoot } from 'lib/cards'
import Hand from './hand'

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
  playerHand: Card[] = []

  @observable
  dealerHand: Card[] = []

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
      this.discardShoot.add(this.playerHand)
      hand.length = 0
    })
  }

  @action.bound
  deal = () => {
    this.clearHands()

    _.times(2, () => {
      this.playerHand = this.playerHand.concat(this.shoot.remove())
      this.dealerHand = this.dealerHand.concat(this.shoot.remove())
    })
  }

  @action.bound
  onPressDeal = () => {
    this.deal()
  }

  @action.bound
  onPressHit = () => {
    this.playerHand = this.playerHand.concat(this.shoot.remove())
    this.dealerHand = this.dealerHand.concat(this.shoot.remove())
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Hand label="dealer" cards={this.dealerHand} />
        <View style={this.styles.section} />
        <Hand label="player" cards={this.playerHand} />
        <View style={this.styles.section}>{/* Bet */}</View>
        <View style={this.styles.actions}>
          <Button onPress={this.onPressDeal} title="Deal" />
          <View style={this.styles.separator} />
          <Button onPress={this.onPressHit} title="Hit" />
        </View>
        <View style={this.styles.section}>{/* Chips */}</View>
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
      actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
      },
      separator: {
        width: 16,
      },
      section: {
        flex: 1,
        alignItems: 'center',
        marginTop: 32,
      },
    })
  }
}
