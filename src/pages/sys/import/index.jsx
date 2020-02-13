import React from 'react'
import { FanoTable } from 'fano-antd'
import { withLocale, get } from 'kuu-tools'
import { Modal, Table, Button, Badge } from 'antd'
import _ from 'lodash'
import { exportTable } from '@/components/sys/import-template'

class ImportRecords extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: false,
      list: [],
      viewType: ''
    }
  }

  handleDownload (columns, data, exportFileName) {
    exportTable(columns, data, exportFileName)
  }

  render () {
    const { visible, viewType, list } = this.state

    // 处理导入状态
    const statusMap = {
      importing: {
        text: this.props.L('kuu_import_status_importing', 'Importing'),
        color: '#1890ff'
      },
      success: {
        text: this.props.L('kuu_import_status_success', 'Success'),
        color: '#52c41a'
      },
      failed: {
        text: this.props.L('kuu_import_status_failed', 'Failed'),
        color: '#f5222d'
      }
    }

    const filter = [
      {
        name: 'ImportSn'
      },
      {
        name: 'Channel'
      },
      {
        name: 'Status'
      },
      {
        name: 'Message'
      }
    ]

    const columns = [
      {
        title: this.props.L('kuu_import_importsn', 'Serial No'),
        dataIndex: 'ImportSn'
      },
      {
        title: this.props.L('kuu_import_channel', 'Channel'),
        dataIndex: 'Channel',
        render: (text) => (
          this.props.L(`kuu_import_channel_${text}`, text)
        )
      },
      {
        title: this.props.L('kuu_import_status', 'Status'),
        dataIndex: 'Status',
        render: (text) => (
          text ? <Badge color={_.get(statusMap, `${text}.color`)} text={_.get(statusMap, `${text}.text`)} /> : ''
        )
      },
      {
        title: this.props.L('kuu_import_message', 'Message'),
        dataIndex: 'Message'
      },
      {
        title: this.props.L('kuu_import_createdat', 'Import Time'),
        dataIndex: 'CreatedAt',
        render: 'date,YYYY-MM-DD HH:mm:ss'
      }
    ]

    const rowActions = [
      {
        text: this.props.L('kuu_import_data', 'View Imported'),
        show: record => !_.isEmpty(record.Data),
        onClick: (record) => this.setState({
          visible: true,
          list: record.Data ? _.cloneDeep(JSON.parse(record.Data)) : [],
          viewType: this.props.L('kuu_import_data', 'View Imported')
        })
      },
      {
        text: this.props.L('kuu_import_feedback', 'View Feedback'),
        show: record => !_.isEmpty(record.Feedback),
        onClick: (record) => this.setState({
          visible: true,
          list: record.Feedback ? _.cloneDeep(JSON.parse(record.Feedback)) : [],
          viewType: this.props.L('kuu_import_feedback', 'View Feedback')
        })
      },
      {
        text: this.props.L('kuu_import_reimport', 'Reimport'),
        show: record => record.Status !== 'importing',
        onClick: async record => {
          const ret = await get(`/reimport?import_sn=${record.ImportSn}`)
          if (ret) {
            this.table.handleRefresh()
          }
        }
      }
    ]

    const fillTAP = {
      add: false,
      del: false,
      import: false
    }

    const fillRAP = {
      edit: false,
      del: false
    }

    // 处理modal 表头信息及数据
    const modalColumns = []
    const dataSource = []
    if (list.length > 0) {
      list.splice(0, 1)[0].map((item, index) => {
        modalColumns[index] = {
          title: item,
          dataIndex: `dataIndex${index}`,
          key: `dataIndex${index}`
        }
      })
      list.map((item, index) => {
        const obj = { key: index }
        if (item && item.length > 0) {
          item.map((k, i) => {
            obj[`dataIndex${i}`] = k
          })
        }
        dataSource[index] = obj
      })
    }

    const footer = (
      <div>
        <Button
          type='primary'
          onClick={() => this.handleDownload(modalColumns, dataSource, viewType)}
          style={{ marginRight: '0.5rem' }}
        >
          {this.props.L('kuu_import_download', 'Download')}
        </Button>
      </div>
    )

    return (
      <div className='kuu-container'>
        <FanoTable
          filterReplace
          filter={filter}
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          rowClickToggleDrawer={false}
          rowActions={rowActions}
          fillTAP={fillTAP}
          fillRAP={fillRAP}
          rowClickSelected={false}
          listUrl='/importrecord'
          url='/importrecord'
        />
        <Modal
          title={viewType || ''}
          width='60vw'
          visible={visible}
          onCancel={() => this.setState({ visible: false })}
          footer={footer}
        >
          <Table
            columns={modalColumns}
            dataSource={dataSource}
            size='small'
          />
        </Modal>
      </div>
    )
  }
}

export default withLocale(ImportRecords)
