import React from 'react'
import { Icon, Input, Select, Button } from 'antd'
import { FanoTable, FanoTreeSelect } from 'fano-antd'
import { parseIcon } from 'kuu-tools'
import _ from 'lodash'
import moment from 'moment'
import styles from './index.less'

class Role extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      columns: [
        {
          title: '角色名称',
          dataIndex: 'Name'
        },
        {
          title: '角色编码',
          dataIndex: 'Code'
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
          name: 'Name',
          type: 'input',
          label: '角色名称',
          props: {
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请输入角色名称')
                }
              ]
            }
          }
        },
        {
          name: 'Code',
          type: 'input',
          label: '角色编码',
          props: {
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请输入角色编码')
                }
              ]
            }
          }
        },
        {
          name: 'ViewOperationPrivileges',
          type: 'treeselect',
          label: '操作权限',
          props: {
            url: '/api/menu?range=ALL&sort=Sort',
            titleKey: 'Name',
            valueKey: 'Code',
            arrayToTree: true,
            multiple: true,
            treeCheckable: true,
            titleRender: (title, item) => <span><Icon {...parseIcon(item.Icon)} /> {title}</span>,
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请设置操作权限')
                }
              ]
            },
            layout: {
              colProps: {
                span: 24
              }
            },
            style: {
              maxWidth: 808
            }
          }
        },
        {
          name: 'DataPrivileges',
          type: 'render',
          label: '数据权限',
          props: {
            layout: {
              colProps: {
                span: 24
              }
            },
            render: props => {
              return (
                <div>
                  {(props.value || []).map((item, index) => {
                    return (
                      <div
                        className={styles.dpItem}
                        key={item.key || item.ID}
                      >
                        <Input.Group
                          compact
                        >
                          <FanoTreeSelect
                            config={{
                              props: {
                                style: { width: 120 },
                                url: '/api/org?range=ALL&sort=Sort',
                                titleKey: 'Name',
                                valueKey: 'ID',
                                arrayToTree: true,
                                placeholder: window.L('请选择组织')
                              }
                            }}
                            value={item.TargetOrgID}
                            onChange={v => {
                              const value = _.cloneDeep(props.value)
                              _.set(value, `[${index}].TargetOrgID`, v)
                              props.onChange(value)
                            }}
                          />
                          <Select
                            defaultValue='PERSONAL'
                            placeholder={window.L('请选择可读范围')}
                            value={item.ReadableRange}
                            onChange={v => {
                              const value = _.cloneDeep(props.value)
                              _.set(value, `[${index}].ReadableRange`, v)
                              props.onChange(value)
                            }}
                          >
                            <Select.Option value='PERSONAL'>{window.L('个人范围可读')}</Select.Option>
                            <Select.Option value='CURRENT'>{window.L('当前组织可读')}</Select.Option>
                            <Select.Option value='CURRENT_FOLLOWING'>{window.L('当前及以下可读')}</Select.Option>
                          </Select>
                          <Select
                            defaultValue='PERSONAL'
                            placeholder={window.L('请选择可写范围')}
                            value={item.WritableRange}
                            onChange={v => {
                              const value = _.cloneDeep(props.value)
                              _.set(value, `[${index}].WritableRange`, v)
                              props.onChange(value)
                            }}
                          >
                            <Select.Option value='PERSONAL'>{window.L('个人范围可写')}</Select.Option>
                            <Select.Option value='CURRENT'>{window.L('当前组织可写')}</Select.Option>
                            <Select.Option value='CURRENT_FOLLOWING'>{window.L('当前及以下可写')}</Select.Option>
                          </Select>
                          <Button
                            size={'small'}
                            type={'danger'}
                            icon={'minus'}
                            shape={'circle'}
                            className={styles.dpItemDel}
                            onClick={() => {
                              const value = _.cloneDeep(props.value)
                              value.splice(index, 1)
                              props.onChange(value)
                            }}
                          />
                        </Input.Group>
                      </div>
                    )
                  })}
                  <div className={styles.dpItemAdd}>
                    <Button
                      size={'small'}
                      type={'link'}
                      icon={'plus-circle'}
                      onClick={() => {
                        const newVal = {
                          key: new Date().getTime(),
                          RoleID: _.get(props, 'rootProps.value.ID'),
                          ReadableRange: 'CURRENT_FOLLOWING',
                          WritableRange: 'CURRENT_FOLLOWING'
                        }
                        const value = _.cloneDeep(props.value) || []
                        value.push(newVal)
                        props.onChange(value)
                      }}
                    >
                      {window.L('添加权限')}
                    </Button>
                  </div>
                </div>
              )
            },
            fieldOptions: {
              rules: [
                {
                  required: true,
                  message: window.L('请设置数据权限权限')
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
      <div className={styles.role}>
        <FanoTable
          columns={columns}
          form={form}
          url={'/api/role'}
          drawerWidth={600}
          listUrl={'GET /api/role?preload=OperationPrivileges,DataPrivileges'}
          onFormRecord={record => {
            record.ViewOperationPrivileges = _.chain(record)
              .get('OperationPrivileges', [])
              .map(item => item.MenuCode)
              .value()
          }}
          beforeSave={(values, formRecord) => {
            const viewOps = _.get(values, 'doc.ViewOperationPrivileges', values.ViewOperationPrivileges)
            if (viewOps) {
              const ops = []
              const groupBy = _.groupBy(formRecord.OperationPrivileges, 'MenuCode')
              for (const code of viewOps) {
                const op = _.get(groupBy, `[${code}][0]`)
                if (_.get(op, 'ID')) {
                  delete groupBy[code]
                  continue
                }
                ops.push({
                  MenuCode: code,
                  RoleID: formRecord.ID
                })
              }
              if (!_.isEmpty(groupBy)) {
                for (const code in groupBy) {
                  const item = _.get(groupBy, `[${code}][0]`)
                  if (!item.ID) {
                    continue
                  }
                  ops.push({ ID: item.ID, DeletedAt: moment().format() })
                }
              }
              if (_.has(values, 'doc')) {
                // 修改
                _.set(values, 'doc.OperationPrivileges', ops)
                delete values.doc.ViewOperationPrivileges
              } else {
                // 新增
                _.set(values, 'OperationPrivileges', ops)
                delete values.ViewOperationPrivileges
              }
            }
          }}
        />
      </div>
    )
  }
}

export default Role
