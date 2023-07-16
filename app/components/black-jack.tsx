import React, { Component } from 'react'
import { action, computed, makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Appearance, Button, InteractionManager, StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import Card from './card'
import { Deck } from 'lib/deck'

const isDarkMode = true // Appearance.getColorScheme() === 'dark'

@observer
export default class BlackJack extends Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @observable
  deck: Deck = null

  componentDidMount() {
    InteractionManager.runAfterInteractions(this.afterInteractionSetup)
  }

  @action.bound
  afterInteractionSetup = () => {
    console.log('>>> afterInteractionSetup')
    this.deck = Deck.newShoot(8)
    this.deck.shuffle()
  }

  @action.bound
  onPressShuffle = () => {
    console.log('>>> onPressShuffle')
    this.deck.shuffle()
  }

  render() {
    if (_.isNil(this.deck)) {
      return null
    }

    return (
      <View style={this.styles.container}>
        <Text>hello blackjack</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Card card={this.deck.cards[0]} />
          <Card card={this.deck.cards[1]} />
        </View>
        <Button onPress={this.onPressShuffle} title="Shuffle" />
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
