import React, { Component, ReactNode } from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { StyleSheet, Text, View } from 'react-native'
import _ from 'lodash'
import { Card } from 'lib/cards'

const INITIAL_DIMENSION_FACTOR = 25

interface Props {
  scale?: number
  card: Card
  layeredIndex?: number
  flipped?: boolean
}

@observer
export default class CardView extends Component<Props> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  static defaultProps = {
    scale: 1,
  }

  render() {
    return (
      <CardContainer scale={this.props.scale} layeredIndex={this.props.layeredIndex}>
        {!this.props.flipped && (
          <>
            <Text style={this.styles.text}>{this.props.card.rankName}</Text>
            <Text style={this.styles.text}>{this.props.card.suit}</Text>
          </>
        )}
      </CardContainer>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      text: {
        fontSize: 10 * this.props.scale,
        textAlign: 'center',
      },
    })
  }
}

interface EmptyCardViewProps {
  scale: number
}

export class EmptyCardView extends Component<EmptyCardViewProps> {
  render() {
    return (
      <CardContainer scale={this.props.scale} hidden={true} />
    )
  }
}

interface CardContainerProps {
  scale?: number
  layeredIndex?: number
  children?: ReactNode
  hidden?: boolean
}

@observer
class CardContainer extends Component<CardContainerProps> {
  constructor(props) {
    super(props)
    makeObservable(this)
  }

  static defaultProps = {
    scale: 1,
  }

  @computed
  get dimensionsFactor() {
    return this.props.scale * INITIAL_DIMENSION_FACTOR
  }

  @computed
  get positionLeft() {
    if (_.isNil(this.props.layeredIndex)) {
      return 0
    }

    return -this.props.layeredIndex * this.dimensionsFactor * 1.69
  }

  render() {
    return (
      <View style={this.styles.container}>
        <View style={this.styles.cornerLabel}>
          {this.props.children}
        </View>
      </View>
    )
  }

  @computed
  get styles() {
    return StyleSheet.create({
      container: {
        left: this.positionLeft,
        width: 2.25 * this.dimensionsFactor,
        height: 3.5 * this.dimensionsFactor,
        borderRadius: this.props.hidden ? null : 8 * this.props.scale,
        borderWidth: this.props.hidden ? null : 1,
        margin: 4 * this.props.scale,
        padding: 4 * this.props.scale,
        borderColor: this.props.hidden ? null : '#333',
        backgroundColor: this.props.hidden ? null : '#000',
      },
      cornerLabel: {
        width: 14 * this.props.scale,
      }
    })
  }
}

