import React, { Component } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'

const INITIAL_DIMENSION_FACTOR = 33

interface Props {
  scale?: number
  card: Card
}

@observer
export default class Card extends Component {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  static defaultProps = {
    scale: 1
  }

  @computed
  get dimensions_factor() {
    return this.props.scale * INITIAL_DIMENSION_FACTOR
  }

  onPressDeal = () => console.log('>>> onPressDeal')

  render() {
    return (
      <View style={this.styles.container}>
        <Text style={this.styles.text}>{this.props.card.name}</Text>
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        height: 3.5 * this.dimensions_factor,
        width: 2.25 * this.dimensions_factor,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8 * this.props.scale,
        borderWidth: 1,
        margin: 4 * this.props.scale,
        borderColor: '#333',
        backgroundColor: '#000',
      },
      text: {
        fontSize: 16 * this.props.scale
      }
    })
  }
}
