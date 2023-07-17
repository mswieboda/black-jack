import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'

const INITIAL_DIMENSION_FACTOR = 25

interface Props {
  scale?: number
  card: Card
}

@observer
export default class Card extends Component<Props> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  static defaultProps = {
    scale: 1,
  }

  @computed
  get dimensions_factor() {
    return this.props.scale * INITIAL_DIMENSION_FACTOR
  }

  onPressDeal = () => console.log('>>> onPressDeal')

  render() {
    return (
      <View style={this.styles.container}>
        <View style={this.styles.cornerLabel}>
          <Text style={this.styles.text}>{this.props.card.rankName}</Text>
          <Text style={this.styles.text}>{this.props.card.suit}</Text>
        </View>
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        height: 3.5 * this.dimensions_factor,
        width: 2.25 * this.dimensions_factor,
        borderRadius: 8 * this.props.scale,
        borderWidth: 1,
        margin: 4 * this.props.scale,
        padding: 4 * this.props.scale,
        borderColor: '#333',
        backgroundColor: '#000',
      },
      cornerLabel: {
        width: 14 * this.props.scale,
      },
      text: {
        fontSize: 10 * this.props.scale,
        textAlign: 'center',
      },
    })
  }
}
