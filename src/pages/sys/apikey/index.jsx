import React from 'react'
import _ from 'lodash'
import { message } from 'antd'
import { FanoTable } from 'fano-antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'
import { update } from 'kuu-tools'
import styles from './index.less'

class APIKey extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: window.L('描述'),
          dataIndex: 'Desc',
          render: t => (t || window.L('用户登录'))
        },
        {
          title: '有效状态',
          dataIndex: 'State',
          render: 'switch'
        },
        {
          title: '过期时间',
          dataIndex: 'Exp',
          render: t => moment.unix(t).diff(moment(), 'years') > 100 ? window.L('令牌永不过期') : moment.unix(t).format('YYYY-MM-DD HH:mm:ss')
        },
        {
          title: '创建时间',
          dataIndex: 'CreatedAt',
          render: t => moment(t).fromNow()
        }
      ],
      form: [
        {
          name: 'Desc',
          type: 'textarea',
          label: window.L('描述'),
          props: {
            rows: 2,
            placeholder: window.L('APIKey描述占位符', '例如: 此密钥由任务调度服务器使用，用于任务触发部署。'),
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请输入用途描述')
                }
              ]
            }
          }
        },
        {
          name: 'Exp',
          type: 'radio',
          label: window.L('过期时间'),
          props: {
            options: [
              {
                label: window.L('永不过期', '令牌将永不过期，请谨慎设置'),
                value: 'never'
              },
              {
                label: window.L('一天后过期', '从现在开始，有效期1天'),
                value: 'day'
              },
              {
                label: window.L('一周后过期', '从现在开始，有效期1周'),
                value: 'week'
              },
              {
                label: window.L('一个月后过期', '从现在开始，有效期1个月'),
                value: 'month'
              },
              {
                label: window.L('一年后过期', '从现在开始，有效期1年'),
                value: 'year'
              }
            ],
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请选择过期时间')
                }
              ]
            }
          }
        }
      ]
    }
  }

  render () {
    const { columns, form } = this.state
    return (
      <div className={styles.apikey}>
        <FanoTable
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          form={form}
          url={'/api/signsecret'}
          createUrl={'POST /api/apikeys'}
          rowClickToggleDrawer={false}
          afterList={json => {
            if (!_.isEmpty(json.list)) {
              json.list.map(item => {
                item.State = moment().isBefore(moment.unix(item.Exp)) && item.Method !== 'LOGOUT'
                return item
              })
            }
          }}
          beforeCreate={values => {
            switch (values.Exp) {
              case 'never':
                console.log(moment().add(1000, 'years').format('YYYY-MM-DD HH:mm:ss'))
                values.Exp = moment().add(1000, 'years').unix()
                break
              case 'day':
                values.Exp = moment().add(1, 'days').unix()
                break
              case 'week':
                values.Exp = moment().add(1, 'weeks').unix()
                break
              case 'month':
                values.Exp = moment().add(1, 'months').unix()
                break
              case 'year':
                values.Exp = moment().add(1, 'years').unix()
                break
              default:
                return false
            }
          }}
          rowActions={[
            {
              icon: 'copy',
              wrapper: (children, record) => {
                return (
                  <CopyToClipboard
                    text={record.Token}
                    onCopy={() => message.info(window.L('已复制令牌到剪贴板'), 0.5)}
                  >
                    {children}
                  </CopyToClipboard>
                )
              },
              tooltip: window.L('点击复制令牌')
            },
            {
              icon: 'stop',
              style: {
                color: '#ff4d4f'
              },
              show: record => record.State,
              popconfirm: record => ({
                title: window.L('令牌作废二次确认提示', '确定要作废该令牌吗？'),
                onConfirm: async () => {
                  const ret = await update('signsecret', { ID: record.ID }, { Method: 'LOGOUT' })
                  if (ret) {
                    this.table.handleRefresh()
                  }
                }
              }),
              tooltip: window.L('立即作废')
            },
            {
              icon: 'rollback',
              show: record => !record.State && moment().isBefore(moment.unix(record.Exp)),
              popconfirm: record => ({
                title: window.L('令牌撤销二次确认提示', '确定重新启用该令牌吗？'),
                onConfirm: async () => {
                  const ret = await update('signsecret', { ID: record.ID }, { Method: 'LOGIN' })
                  if (ret) {
                    this.table.handleRefresh()
                  }
                }
              }),
              tooltip: window.L('令牌撤销')
            }
          ]}
        />
      </div>
    )
  }
}

export default APIKey
