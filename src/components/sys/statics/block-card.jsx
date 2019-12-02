import React from 'react'
import { Card, Tooltip, Icon } from 'antd'
import BaseStatic from './base-static'
import styles from './block-card.less'

export default class BlockCard extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      title: props.title || '',
      subTitle: props.subTitle || '',
      message: props.message || '',
      option: props.option || []
    }
  }

  componentWillReceiveProps (nextprops) {
    this.setState({
      title: nextprops.title,
      subTitle: nextprops.subTitle,
      message: nextprops.message,
      option: nextprops.option || []
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.title !== nextState.title || nextProps.subTitle !== nextState.subTitle ||
      nextProps.message !== nextState.message || nextProps.option !== nextState.option) {
      return true
    }
  }

  render () {
    const { title, subTitle, message, option } = this.state

    return (
      <div className={styles.blockCard}>
        <Card className={styles.blockCardItem} bordered={false} bodyStyle={{ padding: '10px 15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={styles.title}>{title}</div>
            <Tooltip title="这是一个提示信息">
              <Icon type="question-circle" />
            </Tooltip>
          </div>
          <div style={{ padding: '0.5em' }}>
            <div>{subTitle}</div>
            <BaseStatic style={{ height: 80 }} option={option} />
            <div style={{ width: '100%', height: '1px', backgroundColor: '#aaa', marginBottom: '0.5em' }} />
            <div style={{ fontWeight: 600 }}>{message}</div>
          </div>
        </Card>
      </div>
    )
  }
}
