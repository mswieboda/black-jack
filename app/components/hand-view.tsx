import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import { Hand } from 'lib/cards'
import CardView, { EmptyCardView } from './card-view'

interface Props {
  label: string
  isDealer?: boolean
  isDealerTurn?: boolean
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
    const showHand = !this.props.isDealer || this.props.isDealerTurn
    return `${this.props.label}: ${showHand ? this.props.hand.display : '???'}`
  }

  render() {
    return (
      <View>
        <Text style={this.styles.label}>{this.label}</Text>
        {_.isEmpty(this.props.hand.cards) ? (
          <EmptyCardView scale={1.5} />
        ) : (
          <View style={this.styles.cards}>
            {this.props.hand.cards.map((card, index) => (
              <CardView
                card={card}
                key={card.key}
                scale={1.5}
                layeredIndex={index}
                flipped={
                  this.props.isDealer && index === 1 && !this.props.isDealerTurn
                }
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
      label: {
        fontSize: 16,
      },
      cards: {
        flexDirection: 'row',
      },
    })
  }
}
