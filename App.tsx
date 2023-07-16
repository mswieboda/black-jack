import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import {
  Appearance,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native'
import BlackJack from './app/components/black-jack.tsx'

@observer
export default class App extends Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get isDarkMode() {
    return Appearance.getColorScheme() === 'dark'
  }

  render() {
    return (
      <SafeAreaView style={[this.styles.safeArea, this.styles.background]}>
        <StatusBar
          barStyle={this.isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={this.styles.background.backgroundColor}
        />
        <BlackJack />
      </SafeAreaView>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      safeArea: {
        flex: 1
      },
      background: {
        backgroundColor: this.isDarkMode ? '#131313' : '#f0f0f0',
      }
    })
  }
}
