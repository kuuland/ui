import React from 'react'
import { FanoTable } from 'fano-antd'
import { withLocale } from 'kuu-tools'
import styles from './index.less'
import moment from 'moment'

class Org extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: this.props.L('kuu_org_name', 'Name'),
          dataIndex: 'Name',
          sorter: false,
          width: 500
        },
        {
          title: this.props.L('kuu_org_code', 'Code'),
          dataIndex: 'Code',
          width: 150
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
      ],
      form: [
        {
          name: 'Pid',
          type: 'treeselect',
          label: this.props.L('kuu_org_parent', 'Parent'),
          props: {
            url: '/api/org?range=ALL&sort=Sort&project=ID,Code,Name,Pid',
            titleKey: 'Name',
            valueKey: 'ID'
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: this.props.L('kuu_org_name', 'Name')
        },
        {
          name: 'Code',
          type: 'input',
          label: this.props.L('kuu_org_code', 'Code')
        },
        {
          name: 'Sort',
          type: 'number',
          label: this.props.L('kuu_org_sort', 'Sort'),
          props: {
            precision: 0
          }
        }
      ]
    }
  }

  render () {
    const { columns, form } = this.state
    return (
      <div className={styles.org}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/api/org?range=ALL&sort=Sort'}
          pagination={false}
          expandAllRows
          arrayToTree
        />
      </div>
    )
  }
}

export default withLocale(Org)
