import React from 'react'
import { FanoTable } from 'fano-antd'
import styles from './index.less'

export default class Org extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          dataIndex: 'rowNo',
          display: false
        },
        {
          title: '组织名称',
          dataIndex: 'Name',
          sorter: false
        },
        {
          title: '组织编码',
          dataIndex: 'Code',
          sorter: false
        },
        {
          title: '排序',
          dataIndex: 'Sort',
          filter: false,
          align: 'center'
        }
      ],
      form: [
        {
          name: 'Pid',
          type: 'treeselect',
          label: '上级组织',
          props: {
            url: '/api/org?range=ALL&sort=Sort&project=ID,Code,Name,Pid',
            titleKey: 'Name',
            valueKey: 'ID'
          }
        },
        {
          name: 'Code',
          type: 'input',
          label: '组织编码'
        },
        {
          name: 'Name',
          type: 'input',
          label: '组织名称'
        },
        {
          name: 'Sort',
          type: 'number',
          label: '排序',
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
          url={'/api/org'}
        />
      </div>
    )
  }
}
