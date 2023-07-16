import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { Appearance, Button, StyleSheet, Text, View } from 'react-native'
import Card from './card'

@observer
export default class BlackJack extends Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get isDarkMode() {
    return Appearance.getColorScheme() === 'dark'
  }

  onPressDeal = () => console.log('>>> onPressDeal')

  render() {
    return (
      <View style={this.styles.container}>
        <Text>hello blackjack</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <Card />
          <Card />
        </View>
        <Button onPress={this.onPressDeal} title="Deal" />
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: this.isDarkMode ? '#131313' : '#f0f0f0',
      },
    })
  }
}
