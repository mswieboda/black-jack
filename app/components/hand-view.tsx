import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import { Hand } from 'lib/cards'
import CardView from './card-view'

interface Props {
  label: string
  hand: Hand
}

@observer
export default class HandView extends Component<Props> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  @computed
  get label() {
    return `${this.props.label}: ${this.props.hand.display}`
  }

  render() {
    return (
      <View style={this.styles.container}>
        <Text style={this.styles.label}>{this.label}</Text>
        {!_.isEmpty(this.props.hand.cards) && (
          <View style={this.styles.cards}>
            {this.props.hand.cards.map((card, index) => (
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
        margin: 8,
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
