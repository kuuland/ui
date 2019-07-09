import React from 'react'
import { FanoTable } from 'fano-antd'
import arrayToTree from 'array-to-tree'
import styles from './index.less'
import moment from 'moment'
import _ from 'lodash'

export default class Org extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: '组织名称',
          dataIndex: 'Name',
          sorter: false,
          width: 500
        },
        {
          title: '组织编码',
          dataIndex: 'Code',
          width: 150
        },
        {
          title: '创建时间',
          dataIndex: 'CreatedAt',
          width: 100,
          render: t => moment(t).fromNow()
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
          afterList={data => {
            data.list = _.sortBy(data.list, 'Sort')
            data.list = arrayToTree(data.list, {
              customID: 'ID',
              parentProperty: 'Pid',
              childrenProperty: 'children'
            })
            return data
          }}
        />
      </div>
    )
  }
}
