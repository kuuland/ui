import React from 'react'
import _ from 'lodash'
import { Skeleton } from 'antd'
import styles from './$id.less'

class IframePage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      loading: true
    }
  }
  render () {
    const { location } = this.props
    const menuData = location.state
    return (
      <div className={styles.content}>
        <div className={styles.skeleton} style={{ display: this.state.loading ? 'block' : 'none' }}>
          <Skeleton loading={this.state.loading} paragraph={{ rows: _.random(3, 6) }} avatar={{ shape: 'square', size: 'large' }} />
          <Skeleton loading={this.state.loading} paragraph={{ rows: _.random(3, 6) }} avatar={{ shape: 'square', size: 'large' }} />
          <Skeleton loading={this.state.loading} paragraph={{ rows: _.random(4, 8) }} avatar={{ shape: 'square', size: 'large' }} />
        </div>
        <iframe
          className={styles.iframe}
          name={menuData.Name}
          src={menuData.URI}
          onLoad={e => {
            this.setState({
              loading: false
            })
          }}
          frameBorder={0}
          width='100%'
          height={this.state.height}
          style={{
            display: this.state.loading ? 'none' : 'block'
          }}
        />
      </div>
    )
  }
}

export default IframePage
