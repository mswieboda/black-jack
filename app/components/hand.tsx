import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import { Card, handValue } from 'lib/cards'
import CardView from './card-view'

interface Props {
  label: string
  cards: Card[]
}

@observer
export default class Hand extends Component<Props> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get handValueDisplay() {
    const value = handValue(this.props.cards)
    return _.isArrayLikeObject(value) ? value.join('/') : value
  }

  @computed
  get label() {
    return `${this.props.label}: ${this.handValueDisplay}`
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Text style={this.styles.label}>{this.label}</Text>
        {!_.isEmpty(this.props.cards) && (
          <View style={this.styles.cards}>
            {this.props.cards.map((card, index) => (
              <CardView
                card={card}
                key={card.key}
                scale={1.5}
                layeredIndex={index}
              />
            ))}
          </View>
        )}
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        flex: 1,
      },
      label: {
        fontSize: 16,
      },
      cards: {
        flexDirection: 'row',
      },
    })
  }
}
