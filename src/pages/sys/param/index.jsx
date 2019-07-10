import React from 'react'
import { FanoTable } from 'fano-antd'
import moment from 'moment'
import styles from './index.less'

class Param extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: '参数编码',
          dataIndex: 'Code'
        },
        {
          title: '参数名称',
          dataIndex: 'Name'
        },
        {
          title: '参数值',
          dataIndex: 'Value'
        },
        {
          title: '是否内置',
          dataIndex: 'IsBuiltIn',
          render: 'switch'
        },
        {
          title: '创建时间',
          dataIndex: 'CreatedAt',
          render: t => moment(t).fromNow()
        }
      ],

      form: [
        {
          name: 'Code',
          type: 'input',
          label: '参数编码',
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: '参数名称',
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Value',
          type: 'textarea',
          label: '参数值',
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'IsBuiltIn',
          type: 'switch',
          label: '系统内置',
          props: {
            disabled: true
          }
        }
      ]
    }
  }

  render () {
    const { columns, form } = this.state
    return (
      <div className={styles.param}>
        <FanoTable
          url={'/api/param'}
          columns={columns}
          form={form}
        />
      </div>
    )
  }
}

export default Param
