import React from 'react'
import _ from 'lodash'
import { message } from 'antd'
import { FanoTable } from 'fano-antd'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import moment from 'moment'
import { update, withLocale } from 'kuu-tools'
import styles from './index.less'

class APIKeys extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const columns = [
      {
        title: this.props.L('kuu_apikeys_desc', 'Description'),
        dataIndex: 'Desc',
        render: t => (t || this.props.L('kuu_apikeys_desc_render', 'User login'))
      },
      {
        title: this.props.L('kuu_apikeys_state', 'State'),
        dataIndex: 'State',
        render: 'switch'
      },
      {
        title: this.props.L('kuu_apikeys_exp', 'Exp'),
        dataIndex: 'Exp',
        render: t => moment.unix(t).diff(moment(), 'years') > 100 ? this.props.L('kuu_apikeys_exp_never_exp', 'Never Expire') : moment.unix(t).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: this.props.L('kuu_apikeys_createdat', 'Created At'),
        dataIndex: 'CreatedAt',
        render: t => moment(t).fromNow()
      }
    ]
    const form = [
      {
        name: 'Desc',
        type: 'textarea',
        label: this.props.L('kuu_apikeys_desc', 'Description'),
        props: {
          rows: 2,
          placeholder: this.props.L('kuu_apikeys_desc_placeholder', 'Optional: e.g. This key is used by the cron service to trigger jobs'),
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_apikeys_desc_required', 'Please enter a description')
              }
            ]
          }
        }
      },
      {
        name: 'Exp',
        type: 'radio',
        label: this.props.L('kuu_apikeys_exp', 'Exp'),
        props: {
          options: [
            {
              label: this.props.L('kuu_apikeys_exp_options_never', 'Never'),
              value: 'never'
            },
            {
              label: this.props.L('kuu_apikeys_exp_options_day', 'A day from now'),
              value: 'day'
            },
            {
              label: this.props.L('kuu_apikeys_exp_options_week', 'A week from now'),
              value: 'week'
            },
            {
              label: this.props.L('kuu_apikeys_exp_options_month', 'A month from now'),
              value: 'month'
            },
            {
              label: this.props.L('kuu_apikeys_exp_options_year', 'A year from now'),
              value: 'year'
            }
          ],
          fieldOptions: {
            rules: [
              {
                required: true,
                message: this.props.L('kuu_apikeys_exp_required', 'Please select automatic expiration time')
              }
            ]
          }
        }
      }
    ]
    return (
      <div className={styles.apikey}>
        <FanoTable
          ref={instance => {
            this.table = instance
          }}
          columns={columns}
          form={form}
          url={'/signsecret'}
          createUrl={'POST /apikeys'}
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
              text: this.props.L('kuu_apikeys_token_copy_txt', 'Copy'),
              wrapper: (children, record) => {
                return (
                  <CopyToClipboard
                    text={record.Token}
                    onCopy={() => message.info(this.props.L('kuu_apikeys_token_copy_copied', 'The token has been copied'), 0.5)}
                  >
                    {children}
                  </CopyToClipboard>
                )
              },
              tooltip: this.props.L('kuu_apikeys_token_copy_tooltip', 'Click to copy token')
            },
            {
              icon: 'stop',
              text: this.props.L('kuu_apikeys_token_exp_txt', 'Expire'),
              style: {
                color: '#ff4d4f'
              },
              show: record => record.State,
              popconfirm: record => ({
                title: this.props.L('kuu_apikeys_token_exp_confirm', 'Are you sure to expire this token?'),
                onConfirm: async () => {
                  const ret = await update('signsecret', { ID: record.ID }, { Method: 'LOGOUT' })
                  if (ret) {
                    this.table.handleRefresh()
                  }
                }
              }),
              tooltip: this.props.L('kuu_apikeys_token_exp_tooltip', 'Expired now')
            },
            {
              icon: 'rollback',
              show: record => !record.State && moment().isBefore(moment.unix(record.Exp)),
              text: this.props.L('kuu_apikeys_token_enable_txt', 'Enable'),
              popconfirm: record => ({
                title: this.props.L('kuu_apikeys_token_enable_confirm', 'Are you sure to re-enable the token?'),
                onConfirm: async () => {
                  const ret = await update('signsecret', { ID: record.ID }, { Method: 'LOGIN' })
                  if (ret) {
                    this.table.handleRefresh()
                  }
                }
              }),
              tooltip: this.props.L('kuu_apikeys_token_enable_tooltip', 'Enable now')
            }
          ]}
        />
      </div>
    )
  }
}

export default withLocale(APIKeys)
