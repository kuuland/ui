import React from 'react'
import _ from 'lodash'
import { connect } from 'dva'
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
    const { location, activePane } = this.props
    const menuData = location.state
    return (
      <div className={`kuu-container ${styles.content}`}>
        <div className={styles.skeleton} style={{ display: this.state.loading ? 'block' : 'none' }}>
          <Skeleton loading={this.state.loading} active />
          <Skeleton loading={this.state.loading} avatar={{ size: 'large' }} active />
          <Skeleton loading={this.state.loading} active />
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
            display: this.state.loading ? 'none' : 'block',
            minHeight: _.size(_.get(activePane, 'breadcrumbs')) > 1 ? '84vh' : '90vh'
          }}
        />
      </div>
    )
  }
}

export default connect(state => ({
  activePane: state.layout.activePane
}))(IframePage)
