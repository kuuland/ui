import React from 'react'
import { Tag, Modal, Input, Radio, Icon, Popconfirm, message } from 'antd'
import Fano from 'fano-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'
import { post } from '@/utils/request'
import { update } from '@/sdk/model'
import styles from './index.less'

class APIKey extends React.Component {
  constructor (props) {
    super(props)
    this.initTable()

    this.state = {
      modalVisible: false
    }
    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  initTable () {
    this.TableInst = Fano.fromJson({
      name: 'apikey_table',
      type: 'table',
      props: {
        bordered: false,
        rowKey: 'ID',
        urls: {
          list: '/api/signsecret',
          remove: '/api/signsecret'
        },
        actions: [
          'table-add',
          'table-del',
          'table-refresh',
          'row-del'
        ],
        customRowActions: [
          record => (
            <Popconfirm
              title={window.L('令牌作废提示', '确定立即作废该令牌吗？')}
              placement='left'
              onConfirm={async () => {
                if (record.ID) {
                  await update('signsecret', { ID: record.ID }, { Method: 'LOGOUT' })
                  this.TableInst.emit('apikey_table:refresh')
                }
              }}
              okText={window.L('立即作废')}
              cancelText={window.L('取消')}
            >
              <Icon
                type='stop'
                title={window.L('作废令牌')}
              />
            </Popconfirm>
          ),
          record => (
            <CopyToClipboard
              text={record.Token}
              onCopy={() => message.info(window.L('已复制令牌到剪贴板'), 0.5)}
            >
              <Icon type='copy' title={window.L('点击复制令牌')} onClick={e => e.stopPropagation()} />
            </CopyToClipboard>
          )
        ],
        columns: [
          {
            dataIndex: 'rowNo',
            display: false
          },
          {
            title: '描述',
            sorter: false,
            filter: false,
            dataIndex: 'Desc',
            render: t => t || window.L('用户登录')
          },
          {
            title: '状态',
            dataIndex: 'State',
            sorter: false,
            filter: false,
            render: (t, r) => {
              let children
              if (moment().isBefore(moment.unix(r.Exp)) && r.Method !== 'LOGOUT') {
                children = (
                  <Tag color={'#87d068'}>ACTIVE</Tag>
                )
              } else {
                children = (
                  <Tag color={'#f50'}>INACTIVE</Tag>
                )
              }
              return children
            }
          },
          {
            title: '过期时间',
            sorter: false,
            filter: false,
            dataIndex: 'Exp',
            render: t => {
              let value = moment.unix(t)
              let diff = value.diff(moment(), 'y')
              if (diff > 500) {
                value = window.L('永不过期')
              } else {
                value = value.fromNow()
              }
              return (
                <div
                  style={{ cursor: 'pointer' }}
                  title={moment.unix(t).format('YYYY-MM-DD HH:mm:ss')}
                >
                  {value}
                </div>
              )
            }
          },
          {
            title: '创建时间',
            sorter: false,
            filter: false,
            dataIndex: 'CreatedAt',
            render: t => (
              <div
                style={{ cursor: 'pointer' }}
                title={moment(t).format('YYYY-MM-DD HH:mm:ss')}
              >
                {moment(t).fromNow()}
              </div>
            )
          }
        ],
        onAdd: () => {
          this.setState({ modalVisible: true })
        }
      }
    })
    this.TableComponent = this.TableInst.render()
  }

  async handleOk () {
    const { newRecord } = this.state
    if (!newRecord.Exp) {
      newRecord.Exp = moment().add(1000, 'y').unix()
    }
    const ret = await post('/api/apikey', newRecord)
    if (ret) {
      this.TableInst.emit('apikey_table:refresh')
      this.handleCancel()
    }
  }
  handleCancel () {
    this.setState({ modalVisible: false, newRecord: undefined })
  }

  render () {
    const { TableComponent } = this
    const { modalVisible, newRecord = {} } = this.state
    return (
      <div className={styles.apikey}>
        <TableComponent />
        <Modal
          width={600}
          maskClosable={false}
          title={window.L('添加APIKey', '添加API Key')}
          cancelText={window.L('取消')}
          okText={window.L('创建')}
          visible={modalVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div className={styles.formItem}>
            <div className={styles.itemLabel}>{window.L('描述')}</div>
            <Input
              placeholder={window.L('描述占位符', '例如: 此密钥由应用服务器使用，用于容器部署。')}
              value={newRecord.Desc}
              onChange={e => {
                newRecord.Desc = e.target.value
                this.setState({ newRecord })
              }}
            />
          </div>
          <div className={styles.formItem}>
            <div className={styles.itemLabel}>{window.L('自动失效时间')}</div>
            <Radio.Group
              onChange={e => {
                const key = e.target.value
                let value
                switch (key) {
                  case 'never':
                    value = moment().add(1000, 'y').unix()
                    break
                  case 'oneday':
                    value = moment().add(1, 'd').unix()
                    break
                  case 'onemonth':
                    value = moment().add(1, 'M').unix()
                    break
                  case 'oneyear':
                    value = moment().add(1, 'y').unix()
                    break
                }
                const { newRecord = {} } = this.state
                newRecord.ExpStr = key
                newRecord.Exp = value
                this.setState({ newRecord })
              }}
              value={newRecord.ExpStr || 'never'}
            >
              <Radio className={styles.radioStyle} value={'never'}>
                {window.L('永不过期')}
              </Radio>
              <Radio className={styles.radioStyle} value={'oneday'}>
                {window.L('一天后过期', '从现在开始，有效期1天')}
              </Radio>
              <Radio className={styles.radioStyle} value={'onemonth'}>
                {window.L('一个月后过期', '从现在开始，有效期1个月')}
              </Radio>
              <Radio className={styles.radioStyle} value={'oneyear'}>
                {window.L('一年后过期', '从现在开始，有效期1年')}
              </Radio>
            </Radio.Group>
          </div>
        </Modal>
      </div>
    )
  }
}

export default APIKey
