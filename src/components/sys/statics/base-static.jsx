import React from 'react'
import ReactEcharts from 'echarts-for-react'

export default class BaseStatic extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      option: props.option || {}
    }
    this.handleDatazoom = this.handleDatazoom.bind(this)
  }

  componentWillReceiveProps (nextprops) {
    this.setState({
      option: nextprops.option
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return nextProps.option !== nextState.option
  }

  handleDatazoom (e) {
    if (this.props.getDatazoom) {
      this.props.getDatazoom(e)
    }
  }

  render () {
    const { option } = this.state

    var getOption = () => {
      return option
    }

    const onEvents = {
      datazoom: (e) => this.handleDatazoom(e)
    }

    return (
      <div>
        <ReactEcharts
          theme='light'
          option={getOption()}
          style={this.props.style}
          onEvents={onEvents}
        />
      </div>
    )
  }
}
