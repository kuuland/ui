import React from 'react'
import { Table, Switch } from 'antd'
import { FanoTable } from 'fano-antd'
import { withLocale } from 'kuu-tools'
import styles from './index.less'

class Metadata extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { modules = [], metaNames = [] } = this.state
    const columns = [
      {
        title: this.props.L('kuu_meta_code', 'Module'),
        dataIndex: 'ModCode',
        filters: modules.map(item => ({ text: item, value: item })),
        onFilter: (value, record) => record.ModCode === value
      },
      {
        title: this.props.L('kuu_meta_name', 'Name'),
        dataIndex: 'Name',
        filters: metaNames.map(item => ({ text: item, value: item })),
        onFilter: (value, record) => record.Name === value
      },
      {
        title: this.props.L('kuu_meta_displayname', 'Display Name'),
        dataIndex: 'DisplayName'
      }
    ]
    const fieldsColumns = [
      {
        title: this.props.L('kuu_meta_fields_code', 'Field Code'),
        dataIndex: 'Code',
        key: 'Code',
        width: 250
      },
      {
        title: this.props.L('kuu_meta_fields_name', 'Field Name'),
        dataIndex: 'Name',
        key: 'Name',
        width: 250
      },
      {
        title: this.props.L('kuu_meta_fields_kind', 'Kind'),
        dataIndex: 'Kind',
        key: 'Kind',
        width: 100
      },
      {
        title: this.props.L('kuu_meta_fields_enum', 'Enum'),
        dataIndex: 'Enum',
        key: 'Enum',
        width: 120
      },
      {
        title: this.props.L('kuu_meta_fields_isref', 'Is Ref'),
        dataIndex: 'IsRef',
        key: 'IsRef',
        width: 120,
        render: t => <Switch checked={t} />
      },
      {
        title: this.props.L('kuu_meta_fields_ispassword', 'Is Password'),
        dataIndex: 'IsPassword',
        key: 'IsPassword',
        width: 120,
        render: t => <Switch checked={t} />
      },
      {
        title: this.props.L('kuu_meta_fields_isarray', 'Is Array'),
        dataIndex: 'IsArray',
        key: 'IsArray',
        width: 120,
        render: t => <Switch checked={t} />
      }
    ]
    return (
      <div className={styles.metadata}>
        <FanoTable
          rowKey='Name'
          listUrl='/meta?json=1'
          columns={columns}
          rowClickToggleDrawer={false}
          rowClickSelected={false}
          rowSelection={null}
          fillTAP={{
            add: false,
            del: false,
            filter: false,
            sort: false
          }}
          afterList={json => {
            this.setState({
              modules: Object.keys(_.groupBy(json, 'ModCode')),
              metaNames: Object.keys(_.groupBy(json, 'Name'))
            })
          }}
          expandedRowRender={record => {
            return (
              <Table
                rowKey='Code'
                dataSource={record.Fields}
                columns={fieldsColumns}
                size='small'
                bordered
                pagination={false}
              />
            )
          }}
        />
      </div>
    )
  }
}

export default withLocale(Metadata)
