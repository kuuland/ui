import React from 'react'
import filesize from 'filesize'
import mime from 'mime'
import { Upload } from 'antd'
import { FanoTable } from 'fano-antd'
import { withLocale } from 'kuu-tools'
import styles from './index.less'
import moment from 'moment'

class File extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const columns = [
      {
        title: this.props.L('kuu_file_name', 'Name'),
        dataIndex: 'Name',
        width: 300,
        render: (name, record) => (
          <a
            href={record.URL}
            target='_blank'
            rel='noopener noreferrer'
            onClick={e => {
              e.stopPropagation()
            }}
          >
            {name}
          </a>
        )
      },
      {
        title: this.props.L('kuu_file_preview', 'Preview'),
        dataIndex: 'URL',
        width: 300,
        render: 'file'
      },
      {
        title: this.props.L('kuu_file_size', 'Size'),
        dataIndex: 'Size',
        render: t => filesize(t)
      },
      {
        title: this.props.L('kuu_file_type', 'Mine-Type'),
        dataIndex: 'Type',
        render: t => (mime.getExtension(t) || '').toUpperCase()
      },
      {
        title: this.props.L('kuu_file_createdat', 'Created At'),
        dataIndex: 'CreatedAt',
        render: t => moment(t).fromNow()
      }
    ]
    return (
      <div className={`kuu-container ${styles.file}`}>
        <FanoTable
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          tableActions={[
            {
              key: 'upload',
              icon: 'upload',
              text: this.props.L('kuu_file_actions_upload', 'Upload'),
              wrapper: children => (
                <Upload
                  multiple
                  showUploadList={false}
                  name='file'
                  action='/api/upload'
                  onChange={info => {
                    if (info.file.status === 'done') {
                      this.table.handleRefresh()
                    }
                  }}
                >
                  {children}
                </Upload>
              )
            }
          ]}
          fillTAP={{ add: false }}
          fillRAP={{ edit: false }}
          rowClickToggleDrawer={false}
          url='/file'
        />
      </div>
    )
  }
}

export default withLocale(File)
