import React from 'react'
import _ from 'lodash'
import arrayToTree from 'array-to-tree'
import { id, list, update, create } from '@/sdk/model'
import { getDict } from '@/sdk/dict'
import { get } from '@/utils/request'
import { Form, Row, Col, Tree, Icon, Input, Button, Spin, Table, Radio, Dropdown, Menu, Tabs, Skeleton } from 'antd'
import styles from './role-detail.less'

class RoleDetail extends React.Component {
  constructor (props) {
    super(props)
    const record = _.get(this.props, 'location.state.Record')
    this.state = {
      menusLoading: true,
      orgsLoading: true,
      saveLoading: false,
      record,
      orgDataPrivileges: _.get(record, 'ID') ? _.chain(record.DataPrivileges).groupBy('OrgID').mapValues(item => _.head(item)).value() : {}
    }
    this.onMenuCheck = this.onMenuCheck.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleSelectedMeta = this.handleSelectedMeta.bind(this)
    this.handleTableSelections = this.handleTableSelections.bind(this)
  }
  async componentDidMount () {
    const idVal = _.get(this.state, 'record.ID')
    if (idVal) {
      await this.fetchDetail(idVal)
    }
    this.fetchMenus()
    this.fetchOrgs()
    this.fetchMetadata()
    this.fetchDict()
  }

  async fetchDetail (idVal) {
    const record = await id('role', idVal)
    this.props.form.setFieldsValue(_.pick(record, ['Code', 'Name']))
    this.setState({ record })
  }

  onMenuCheck (index, checkedKeys) {
    const { splitMenuCheckedKeys = {} } = this.state
    splitMenuCheckedKeys[index] = checkedKeys
    let totalKeys = []
    _.mapValues(splitMenuCheckedKeys, item => {
      if (Array.isArray(item)) {
        totalKeys = totalKeys.concat(item)
      }
    })
    totalKeys = _.uniq(totalKeys)
    this.setState({ splitMenuCheckedKeys, totalMenusCheckedKeys: totalKeys })
  }

  fetchMenus () {
    this.setState({ menusLoading: true }, async () => {
      const { record } = this.state
      const data = await list('menu', { range: 'ALL', sort: 'sort', project: '_id,Pid,Icon,Code,Name,Disable,IsVirtual' })
      const raw = _.get(data, 'list', [])
      const menus = arrayToTree(raw, {
        customID: 'ID',
        parentProperty: 'Pid',
        childrenProperty: 'Children'
      })
      const splitMenuExpandedKeys = {}
      const splitMenuCheckedKeys = {}
      const permissions = _.get(record, 'OperationPrivileges', []).map(item => item.Permission)
      const fall = (values, expandedKeys, checkedKeys) => {
        let checkedCount = 0
        for (const item of values) {
          if (permissions.includes(item.ID) || permissions.includes(item.Code)) {
            checkedCount++
            if (_.isEmpty(item.Children)) {
              checkedKeys.push(item.ID)
            }
          }
          if (!_.isEmpty(item.Children)) {
            expandedKeys.push(item.ID)
            const childrenCount = fall(item.Children, expandedKeys, checkedKeys)
            if (childrenCount === item.Children.length) {
              checkedKeys.push(item.ID)
            }
          }
        }
        return checkedCount
      }
      for (const index in menus) {
        const item = menus[index]
        const expandedKeys = [ item.ID ]
        const checkedKeys = []
        fall(item.Children, expandedKeys, checkedKeys)
        splitMenuExpandedKeys[index] = expandedKeys
        splitMenuCheckedKeys[index] = checkedKeys
      }
      this.setState({ menusLoading: false, menus, splitMenuExpandedKeys, splitMenuCheckedKeys, totalMenusCheckedKeys: permissions })
    })
  }

  fetchOrgs () {
    this.setState({ orgsLoading: true }, async () => {
      const { record = { DataPrivileges: [] } } = this.state
      const data = await list('org', { range: 'ALL', sort: 'sort', project: '_id,Pid,Code,Name' })
      const raw = _.get(data, 'list', [])
      this.orgsMap = _.chain(raw).groupBy('ID').mapValues(item => _.head(item)).value()
      let orgs = arrayToTree(raw, {
        customID: 'ID',
        parentProperty: 'Pid',
        childrenProperty: 'Children'
      })
      orgs = this.shieldLastLevel(orgs)
      const splitOrgExpandedKeys = {}
      const fall = (values, expandedKeys) => {
        for (const item of values) {
          if (!_.isEmpty(item.Children)) {
            expandedKeys.push(item.ID)
            fall(item.Children, expandedKeys)
          }
        }
      }
      for (const index in orgs) {
        const item = orgs[index]
        const expandedKeys = [ item.ID ]
        if (!_.isEmpty(item.Children)) {
          fall(item.Children, expandedKeys)
        }
        splitOrgExpandedKeys[index] = expandedKeys
      }
      const orgDataPrivileges = _.chain(record.DataPrivileges).groupBy('OrgID').mapValues(item => _.head(item)).value()
      this.setState({ orgsLoading: false, orgs, splitOrgExpandedKeys, orgDataPrivileges })
    })
  }

  shieldLastLevel (orgs) {
    let levelCount = 0
    const fall = (values) => {
      levelCount++
      const arr = []
      for (const item of values) {
        if (!_.isEmpty(item.Children)) {
          item.Children = fall(item.Children)
          if (_.isEmpty(item.Children)) {
            delete item.Children
          }
          arr.push(item)
        }
      }
      return arr
    }
    const after = fall(orgs)
    return levelCount <= 1 ? orgs : after
  }

  async fetchMetadata () {
    const metadata = await get('/api/meta')
    this.setState({ metadata })
  }

  async fetchDict () {
    const dataRangeDict = await getDict('sys_data_range')
    this.setState({ dataRangeDict })
  }

  renderMenuTreeChildren (values) {
    values = _.chain(values)
      .filter(item => !!item.Disable !== true || item.IsVirtual === true)
      .sortBy('Sort').value()
    let ret = []
    for (const value of values) {
      if (value.Children) {
        const sub = this.renderMenuTreeChildren(value.Children)
        if (Array.isArray(sub) && sub.length > 0) {
          ret.push(
            <Tree.TreeNode
              icon={<Icon type={value.Icon || 'fire'} />}
              title={`${value.Name} ${value.Code || ''}`}
              key={value.ID}
            >
              {sub}
            </Tree.TreeNode>
          )
        }
      } else {
        ret.push(
          <Tree.TreeNode
            icon={<Icon type={value.Icon} />}
            title={`${value.Name} ${value.Code || ''}`}
            key={value.ID}
          />
        )
      }
    }
    return ret
  }

  renderOrgTreeChildren (values) {
    const { orgDataPrivileges } = this.state
    values = _.sortBy(values, 'Sort')
    let ret = []
    for (const value of values) {
      const current = orgDataPrivileges[value.ID]
      let stateIcon
      if (current) {
        stateIcon = <Icon type='check-circle' className={styles.checkIcon} size='small' />
      }
      if (value.Children) {
        const sub = this.renderOrgTreeChildren(value.Children)
        if (Array.isArray(sub) && sub.length > 0) {
          ret.push(
            <Tree.TreeNode
              title={
                <span>
                  <span>{`${value.Name} ${value.Code || ''}`}</span>
                  <span className={styles.customTreeIcon}>
                    {stateIcon}
                    <Icon type='close-square' className={`customTreeEmtpyIcon ${stateIcon === undefined && styles.forcedHidden}`} onClick={e => {
                      const { orgDataPrivileges } = this.state
                      delete orgDataPrivileges[value.ID]
                      this.setState({ orgDataPrivileges })
                    }} />
                  </span>
                </span>
              }
              key={value.ID}
            >
              {sub}
            </Tree.TreeNode>
          )
        }
      } else {
        ret.push(
          <Tree.TreeNode
            title={
              <span>
                <span>{`${value.Name} ${value.Code || ''}`}</span>
                <span className={styles.customTreeIcon}>
                  {stateIcon}
                  <Icon type='close-square' className={`customTreeEmtpyIcon ${stateIcon === undefined && styles.forcedHidden}`} onClick={e => {
                    const { orgDataPrivileges } = this.state
                    delete orgDataPrivileges[value.ID]
                    this.setState({ orgDataPrivileges })
                  }} />
                </span>
              </span>
            }
            key={value.ID}
          />
        )
      }
    }
    return ret
  }

  handleSubmit (e) {
    e.preventDefault()
    if (this.state.saveLoading) {
      return
    }
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const { record, menus, totalMenusCheckedKeys, orgDataPrivileges } = this.state
      const operationPrivileges = []
      const fall = (values, checkedKeys, collector) => {
        let ret = false
        for (const item of values) {
          // 有子级的菜单
          if (!_.isEmpty(item.Children)) {
            const childrenHit = fall(item.Children, checkedKeys, collector)
            if (childrenHit) {
              collector.push({ Permission: item.ID, Desc: item.Name })
              ret = true
            }
          } else if (checkedKeys.includes(item.ID) || checkedKeys.includes(item.Code)) {
            collector.push({ Permission: item.ID, Desc: item.Name })
            ret = true
          }
        }
        return ret
      }
      fall(menus, totalMenusCheckedKeys, operationPrivileges)
      values.OperationPrivileges = operationPrivileges
      const privileges = Object.values(orgDataPrivileges)
      values.DataPrivileges = this.filterValidPrivileges(privileges)

      this.setState({ saveLoading: true }, async () => {
        if (_.get(record, 'ID')) {
          await update('role', { _id: _.get(record, 'ID') }, values)
        } else {
          await create('role', values)
        }
        this.setState({ saveLoading: false })
        this.handleClose()
      })
    })
  }

  filterValidPrivileges (privileges) {
    if (!_.isEmpty(privileges)) {
      for (const privilege of privileges) {
        if (_.isEmpty(privilege.AuthObjects)) {
          continue
        }
        const arr = []
        for (const authObject of privilege.AuthObjects) {
          if (!authObject.ObjReadableRange) {
            delete authObject.ObjReadableRange
          }
          if (!authObject.ObjWritableRange) {
            delete authObject.ObjWritableRange
          }
          if (authObject.ObjReadableRange && authObject.ObjWritableRange) {
            arr.push(authObject)
          }
        }
        privilege.AuthObjects = arr
      }
    }
    return privileges
  }

  handleClose () {
    window.g_app._store.dispatch({
      type: 'layout/delPane',
      payload: _.get(this.props, 'location.state.ID')
    })
  }

  handleSelectedMeta (key, value) {
    const { metaSelectedRows = [], orgDataPrivileges, orgSelectedData } = this.state
    if (_.isEmpty(metaSelectedRows)) {
      return
    }
    for (const rowData of metaSelectedRows) {
      this.setAuthObject({
        key,
        value,
        orgDataPrivileges,
        orgSelectedData,
        rowData
      })
    }
    this.setState({ orgDataPrivileges })
  }

  setAuthObject ({ key, value, orgDataPrivileges, orgSelectedData, rowData }) {
    const orgSelectedPrivileges = orgDataPrivileges[orgSelectedData.ID] || {}
    const authObjects = _.get(orgSelectedPrivileges, 'AuthObjects', [])
    let index = _.findIndex(authObjects, item => item.Name === rowData.Name)
    index = index >= 0 ? index : authObjects.length
    const prefixKey = `${orgSelectedData.ID}.AuthObjects[${index}]`
    if (value === 'follow_global') {
      const obj = _.get(orgDataPrivileges, prefixKey)
      if (obj) {
        delete obj[key]
        _.set(orgDataPrivileges, prefixKey, obj)
      }
    } else {
      _.set(orgDataPrivileges, `${prefixKey}.${key}`, value)
    }
    _.set(orgDataPrivileges, `${prefixKey}.Name`, rowData.Name)
    _.set(orgDataPrivileges, `${prefixKey}.DisplayName`, rowData.DisplayName)
    _.set(orgDataPrivileges, `${orgSelectedData.ID}.OrgID`, orgSelectedData.ID)
    _.set(orgDataPrivileges, `${orgSelectedData.ID}.OrgName`, orgSelectedData.Name)
  }
  handleMetaTableRadioOnChange (key, v, rowData) {
    const { orgDataPrivileges, orgSelectedData } = this.state
    this.setAuthObject({
      key,
      value: v,
      orgDataPrivileges,
      orgSelectedData,
      rowData
    })
    this.setState({ orgDataPrivileges })
  }

  handleTableSelections (assigns) {
    const { metadata = {}, orgSelectedData = {}, orgDataPrivileges } = this.state
    const orgSelectedPrivileges = orgDataPrivileges[orgSelectedData.ID] || {}
    const orgSelectedAuthObjects = _.chain(orgSelectedPrivileges.AuthObjects || []).groupBy('Name').mapValues(item => _.head(item)).value()

    const selectedRowKeys = []
    const selectedRows = []

    for (const key in metadata) {
      const row = metadata[key]
      const r = _.get(orgSelectedAuthObjects, `${key}.ObjReadableRange`, 'follow_global')
      const w = _.get(orgSelectedAuthObjects, `${key}.ObjWritableRange`, 'follow_global')
      if (assigns) {
        if (r !== 'follow_global' || w !== 'follow_global') {
          selectedRowKeys.push(key)
          selectedRows.push(row)
        }
      } else {
        if (r === 'follow_global' && w === 'follow_global') {
          selectedRowKeys.push(key)
          selectedRows.push(row)
        }
      }
    }
    this.setState({ metaSelectedRowKeys: selectedRowKeys, metaSelectedRows: selectedRows })
  }

  render () {
    const { getFieldDecorator } = this.props.form
    const {
      menus = [],
      splitMenuCheckedKeys = {},
      splitMenuExpandedKeys = {},
      orgs = [],
      splitOrgExpandedKeys = {},
      metadata = {},
      orgSelectedData = {},
      dataRangeDict = {},
      metaSelectedRowKeys = [],
      orgDataPrivileges
    } = this.state
    const metaArr = Object.values(metadata)
    const dataRangeDictValues = _.get(dataRangeDict, 'Values') || []
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const orgSelectedPrivileges = orgDataPrivileges[orgSelectedData.ID] || {}
    const orgSelectedAuthObjects = _.chain(orgSelectedPrivileges.AuthObjects || []).groupBy('Name').mapValues(item => _.head(item)).value()
    const metaTableRowKey = 'Name'
    return (
      <div className={styles.detail}>
        <Form onSubmit={this.handleSubmit}>
          <div className='fano-box'>
            <div className='fano-box-title'>{window.L('基础信息')}</div>
            <div className='fano-box-content'>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label={window.L('角色名称')}
                  >
                    {getFieldDecorator('Name', {
                      rules: [{
                        required: true, message: window.L('请输入角色名称')
                      }]
                    })(
                      <Input />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label={window.L('角色编码')}
                  >
                    {getFieldDecorator('Code')(
                      <Input />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
          </div>
          <div className='fano-box'>
            <div className='fano-box-title'>{window.L('操作权限')}</div>
            <div className='fano-box-content'>
              <Spin
                indicator={<Icon type='loading' style={{ fontSize: 24 }} spin />}
                spinning={this.state.menusLoading}
              >
                <Row
                  className={styles.authRow}
                  gutter={16}
                >
                  {menus.map((item, index) => {
                    const colsProps = {
                      key: index, sm: 24, md: 12, lg: 8
                    }
                    const expandedKeys = splitMenuExpandedKeys[index] || []
                    const checkedKeys = splitMenuCheckedKeys[index] || []
                    return (
                      <Col {...colsProps}>
                        <Tree
                          checkable
                          showLine
                          showIcon
                          defaultExpandedKeys={expandedKeys}
                          defaultCheckedKeys={checkedKeys}
                          onCheck={checkedKeys => this.onMenuCheck(index, checkedKeys)}
                          className={styles.authRowItem}
                        >
                          {this.renderMenuTreeChildren([item])}
                        </Tree>
                      </Col>
                    )
                  })}
                </Row>
              </Spin>
            </div>
          </div>
          <div className='fano-box'>
            <div className='fano-box-title'>{window.L('数据权限')}</div>
            <div className='fano-box-content'>
              <Spin
                indicator={<Icon type='loading' style={{ fontSize: 24 }} spin />}
                spinning={this.state.orgsLoading}
              >
                <Row
                  className={styles.authRow}
                  gutter={16}
                >
                  {orgs.map((item, index) => {
                    const colsProps = {
                      key: index, sm: 24, md: 8
                    }
                    const expandedKeys = splitOrgExpandedKeys[index] || []
                    return (
                      <Col {...colsProps}>
                        <Tree
                          showLine
                          defaultExpandedKeys={expandedKeys}
                          onSelect={selectedKeys => {
                            const selectedOrgID = _.get(selectedKeys, '[0]')
                            const state = { orgSelectedData: undefined, metaSelectedRowKeys: undefined, metaSelectedRows: undefined }
                            if (selectedOrgID) {
                              state.orgSelectedData = this.orgsMap[selectedOrgID]
                            }
                            this.setState(state)
                          }}
                          className={styles.authRowItem}
                        >
                          {this.renderOrgTreeChildren([item])}
                        </Tree>
                      </Col>
                    )
                  })}
                  <Col {...{ key: 'metadata', sm: 24, md: 16 }}>
                    <div style={{ display: orgSelectedData.ID ? 'none' : 'block' }}>
                      <Icon type='arrow-left' />
                      <span style={{ marginLeft: 5, opacity: 0.8 }}>{window.L('请选择左侧组织')}</span>
                      <Skeleton />
                    </div>
                    <Tabs animated={false} defaultActiveKey='all' style={{ display: orgSelectedData.ID ? 'block' : 'none' }}>
                      <Tabs.TabPane tab={window.L('全局授权')} key='all'>
                        <div className={styles.tabContentRow}>
                          <span className={styles.tabContentLabel}>{window.L('全局可读范围', '全局可读范围：')}</span>
                          <Radio.Group
                            value={orgSelectedPrivileges.AllReadableRange}
                            onChange={v => {
                              v = v.target.value
                              const { orgDataPrivileges } = this.state
                              _.set(orgDataPrivileges, `${orgSelectedData.ID}.OrgID`, orgSelectedData.ID)
                              _.set(orgDataPrivileges, `${orgSelectedData.ID}.AllReadableRange`, v)
                              this.setState({ orgDataPrivileges })
                            }}
                          >
                            {dataRangeDictValues.map(item => <Radio.Button key={item.Value} value={item.Value}>{item.Label}</Radio.Button>)}
                          </Radio.Group>
                          <Icon type='close-circle' className={styles.clearIcon} onClick={e => {
                            const { orgDataPrivileges } = this.state
                            const obj = _.get(orgDataPrivileges, `${orgSelectedData.ID}`, {})
                            delete obj.AllReadableRange
                            _.set(orgDataPrivileges, `${orgSelectedData.ID}`, obj)
                            this.setState({ orgDataPrivileges })
                          }} />
                        </div>
                        <div className={styles.tabContentRow}>
                          <span className={styles.tabContentLabel}>{window.L('全局可写范围', '全局可写范围：')}</span>
                          <Radio.Group
                            value={orgSelectedPrivileges.AllWritableRange}
                            onChange={v => {
                              v = v.target.value
                              const { orgDataPrivileges } = this.state
                              _.set(orgDataPrivileges, `${orgSelectedData.ID}.OrgID`, orgSelectedData.ID)
                              _.set(orgDataPrivileges, `${orgSelectedData.ID}.AllWritableRange`, v)
                              this.setState({ orgDataPrivileges })
                            }}
                          >
                            {dataRangeDictValues.map(item => <Radio.Button key={item.Value} value={item.Value}>{item.Label}</Radio.Button>)}
                          </Radio.Group>
                          <Icon type='close-circle' className={styles.clearIcon} onClick={e => {
                            const { orgDataPrivileges } = this.state
                            const obj = _.get(orgDataPrivileges, `${orgSelectedData.ID}`, {})
                            delete obj.AllWritableRange
                            _.set(orgDataPrivileges, `${orgSelectedData.ID}`, obj)
                            this.setState({ orgDataPrivileges })
                          }} />
                        </div>
                      </Tabs.TabPane>
                      <Tabs.TabPane tab={window.L('自定义授权')} key='custom'>
                        <Table
                          rowSelection={{
                            columnWidth: 30,
                            hideDefaultSelections: true,
                            selections: [
                              {
                                key: 'assigns',
                                text: window.L('全选已授权'),
                                onSelect: () => this.handleTableSelections(true)
                              },
                              {
                                key: 'not-assigns',
                                text: window.L('全选未授权'),
                                onSelect: () => this.handleTableSelections(false)
                              }
                            ],
                            selectedRowKeys: metaSelectedRowKeys,
                            onChange: (selectedRowKeys, selectedRows) => {
                              this.setState({ metaSelectedRowKeys: selectedRowKeys, metaSelectedRows: selectedRows })
                            }
                          }}
                          onRow={rowData => ({
                            onClick: () => {
                              let { metaSelectedRowKeys = [], metaSelectedRows = [] } = this.state
                              const key = rowData[metaTableRowKey]
                              if (metaSelectedRowKeys.includes(key)) {
                                metaSelectedRowKeys = metaSelectedRowKeys.filter(item => item !== key)
                                metaSelectedRows = metaSelectedRows.filter(item => item[metaTableRowKey] !== key)
                              } else {
                                metaSelectedRowKeys.push(key)
                                metaSelectedRows.push(rowData)
                              }
                              this.setState({ metaSelectedRowKeys, metaSelectedRows })
                            }
                          })}
                          pagination={false}
                          size='small'
                          rowKey={metaTableRowKey}
                          dataSource={metaArr}
                          columns={[
                            {
                              title: window.L('实体编码'),
                              dataIndex: 'Name',
                              key: 'Name',
                              align: 'center'
                            },
                            {
                              title: window.L('实体名称'),
                              dataIndex: 'DisplayName',
                              key: 'DisplayName',
                              align: 'center'
                            },
                            {
                              title: (
                                <Dropdown overlay={
                                  <Menu onClick={({ key }) => this.handleSelectedMeta('ObjReadableRange', key)}>
                                    <Menu.Item key={'follow_global'}>{window.L('跟随全局')}</Menu.Item>
                                    {dataRangeDictValues.map(item => <Menu.Item key={item.Value}>{item.Label}</Menu.Item>)}
                                    <Menu.Divider />
                                    <Menu.Item key='0' disabled className={styles.redTips}>
                                      <Icon type='info-circle' />
                                      {window.L('批量设置选中行')}
                                    </Menu.Item>
                                  </Menu>
                                }>
                                  <a className='ant-dropdown-link' href='#'>
                                    {window.L('可读范围')} <Icon type='down' />
                                  </a>
                                </Dropdown>
                              ),
                              dataIndex: 'ReadableRange',
                              key: 'ReadableRange',
                              render: (t, r) => {
                                const value = _.get(orgSelectedAuthObjects, `${r.Name}.ObjReadableRange`, 'follow_global')
                                return (
                                  <Radio.Group
                                    className={`${styles.tableRadioGroup} ${value !== 'follow_global' ? styles.tableRadioGroupActive : ''}`}
                                    size='small'
                                    value={value}
                                    onChange={v => {
                                      v = v.target.value
                                      this.handleMetaTableRadioOnChange('ObjReadableRange', v, r)
                                    }}
                                  >
                                    <Radio key={'follow_global'} value={'follow_global'}>
                                      {window.L('跟随全局')}
                                    </Radio>
                                    {dataRangeDictValues.map(item => (
                                      <Radio key={item.Value} value={item.Value}>
                                        {window.L(item.Label)}
                                      </Radio>
                                    ))}
                                  </Radio.Group>
                                )
                              }
                            },
                            {
                              title: (
                                <Dropdown overlay={
                                  <Menu onClick={({ key }) => this.handleSelectedMeta('ObjWritableRange', key)}>
                                    <Menu.Item key={'follow_global'}>{window.L('跟随全局')}</Menu.Item>
                                    {dataRangeDictValues.map(item => <Menu.Item key={item.Value}>{item.Label}</Menu.Item>)}
                                    <Menu.Divider />
                                    <Menu.Item key='0' disabled className={styles.redTips}>
                                      <Icon type='info-circle' />
                                      {window.L('批量设置选中行')}
                                    </Menu.Item>
                                  </Menu>
                                }>
                                  <a className='ant-dropdown-link' href='#'>
                                    {window.L('可写范围')} <Icon type='down' />
                                  </a>
                                </Dropdown>
                              ),
                              dataIndex: 'WritableRange',
                              key: 'WritableRange',
                              render: (t, r) => {
                                const value = _.get(orgSelectedAuthObjects, `${r.Name}.ObjWritableRange`, 'follow_global')
                                return (
                                  <Radio.Group
                                    className={`${styles.tableRadioGroup} ${value !== 'follow_global' ? styles.tableRadioGroupActive : ''}`}
                                    value={value}
                                    size='small'
                                    onChange={v => {
                                      v = v.target.value
                                      this.handleMetaTableRadioOnChange('ObjWritableRange', v, r)
                                    }}
                                  >
                                    <Radio key={'follow_global'} value={'follow_global'}>
                                      {window.L('跟随全局')}
                                    </Radio>
                                    {dataRangeDictValues.map(item => (
                                      <Radio key={item.Value} value={item.Value}>
                                        {window.L(item.Label)}
                                      </Radio>
                                    ))}
                                  </Radio.Group>
                                )
                              }
                            }
                          ]}
                        />
                      </Tabs.TabPane>
                    </Tabs>
                  </Col>
                </Row>
              </Spin>
            </div>
          </div>
          <div className={styles.actions}>
            <div className={styles.buttons}>
              <Button type='primary' htmlType='submit' icon='check' loading={this.state.saveLoading}>{window.L('保存')}</Button>
              <Button icon='undo' onClick={this.handleClose}>{window.L('取消')}</Button>
            </div>
          </div>
        </Form>
      </div>
    )
  }
}

export default Form.create({})(RoleDetail)
