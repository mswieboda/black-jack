import React, { Component } from 'react'
import { action, computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Appearance, Button, InteractionManager, StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import Card from './card'
import { Shoot } from 'lib/cards'

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
    this.deal()
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
    // this.clearHands()

    _.times(2, () => {
      this.playerHand = this.playerHand.concat(this.shoot.remove())
      this.dealerHand = this.dealerHand.concat(this.shoot.remove())
    })
  }

  @action.bound
  onPressStand = () => {
    this.shoot.shuffle()
  }

  @action.bound
  onPressHit = () => {
    this.shoot.shuffle()
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Text>hello blackjack</Text>
        <View>
          <Hand label="dealer" cards={this.dealerHand} />
          <Hand label="player" cards={this.playerHand} />
        </View>
        <Button onPress={this.onPressStand} title="Stand" />
        <Button onPress={this.onPressHit} title="Hit" />
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
    })
  }
}

interface HandProps {
  label: string
  cards: Card[]
}

@observer
class Hand extends Component<HandProps> {
  render() {
    return (
      <View>
        <Text>{this.props.label}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          {_.isEmpty(this.props.cards) ? (
            <Text>no cards</Text>
          ) : this.props.cards.map(card => (
            <Card key={card.name} card={card} />
          ))}
        </View>
      </View>
    )
  }
}
