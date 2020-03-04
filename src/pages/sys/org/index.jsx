import React from 'react'
import { FanoTable } from 'fano-antd'
import { connect } from 'dva'
import { withLocale } from 'kuu-tools'
import styles from './index.less'
import moment from 'moment'
import _ from 'lodash'

class Org extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    let defaultCond = '{}'
    if (!this.props.isRoot) {
      defaultCond = '{"$or":[{"IsBuiltIn":false},{"IsBuiltIn":{"$exists":false}}]}'
    }
    const columns = [
      {
        title: this.props.L('kuu_org_name', 'Name'),
        dataIndex: 'Name'
      },
      {
        title: this.props.L('kuu_org_code', 'Code'),
        dataIndex: 'Code'
      },
      {
        title: this.props.L('kuu_org_sort', 'Sort'),
        dataIndex: 'Sort',
        show: false
      },
      {
        title: this.props.L('kuu_org_createdat', 'Sort'),
        dataIndex: 'CreatedAt',
        width: 100,
        render: t => moment(t).fromNow()
      }
    ]
    const form = [
      {
        name: 'Pid',
        type: 'treeselect',
        label: this.props.L('kuu_org_parent', 'Parent'),
        props: {
          url: `/org?range=ALL&sort=Sort&project=ID,Code,Name,Pid&cond=${defaultCond}`,
          titleKey: 'Name',
          valueKey: 'ID'
        }
      },
      {
        name: 'Name',
        type: 'input'
      },
      {
        name: 'Code',
        type: 'input'
      },
      {
        name: 'Sort',
        type: 'number',
        props: {
          precision: 0
        }
      }
    ]
    return (
      <div className={`kuu-container ${styles.org}`}>
        <FanoTable
          columns={columns}
          form={form}
          url='/org'
          listUrl={`/org?range=ALL&sort=Sort&cond=${defaultCond}`}
          pagination={false}
          expandAllRows
          arrayToTree
        />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    loginData: state.user.loginData || {},
    isRoot: _.get(state, 'user.loginData.Username') === 'root'
  }
}

export default withLocale(connect(mapStateToProps)(Org))
