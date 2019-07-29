import React from 'react'
import { FanoTable } from 'fano-antd'
import moment from 'moment'
import { withLocale } from 'kuu-tools'
import styles from './index.less'

class Param extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: this.props.L('kuu_param_code', 'Code'),
          dataIndex: 'Code'
        },
        {
          title: this.props.L('kuu_param_name', 'Name'),
          dataIndex: 'Name'
        },
        {
          title: this.props.L('kuu_param_value', 'Value'),
          dataIndex: 'Value'
        },
        {
          title: this.props.L('kuu_param_builtin', 'Built-in'),
          dataIndex: 'IsBuiltIn',
          render: 'switch'
        },
        {
          title: this.props.L('kuu_param_createdat', 'Created At'),
          dataIndex: 'CreatedAt',
          render: t => moment(t).fromNow()
        }
      ],

      form: [
        {
          name: 'Code',
          type: 'input',
          label: this.props.L('kuu_param_code', 'Code'),
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Name',
          type: 'input',
          label: this.props.L('kuu_param_name', 'Name'),
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          name: 'Value',
          type: 'textarea',
          label: this.props.L('kuu_param_value', 'Value'),
          props: {
            disabled: `{{_.get(rootValue, 'IsBuiltIn') === true}}`
          }
        },
        {
          condition: `{{!_.isEmpty(_.get(rootValue, 'ID'))}}`,
          name: 'IsBuiltIn',
          type: 'switch',
          label: this.props.L('kuu_param_builtin', 'Built-in'),
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
          url={'/param'}
          columns={columns}
          form={form}
        />
      </div>
    )
  }
}

export default withLocale(Param)
