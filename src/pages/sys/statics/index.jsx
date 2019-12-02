import React from 'react'
import { connect } from 'dva'
import { Switch, Icon, Tooltip, Row, Col, Radio, Input, Button, Table, Pagination, Divider, Menu, Dropdown } from 'antd'
import BaseStatic from '@/components/sys/statics/base-static'
import BlockCard from '@/components/sys/statics/block-card'
import styles from './index.less'

const Statics = ({ dispatch, statics }) => {
  const {
    selectIndex, loginTodayData, effectiveSessionData, currentCallData, changeTodayData, barData,
    loginLogList, interfaceLogList, auditLogList, businessLogList
  } = statics

  function handleTabChange (e) {
    dispatch({
      type: 'statics/save',
      payload: {
        selectIndex: e.target.value
      }
    })
  }

  function handleSwitch (e) {
    dispatch({
      type: 'statics/changeLog',
      payload: e
    })
  }

  // 滑动柱形图下面的滑条触发
  function getDatazoom (e) {
    dispatch({
      type: 'statics/changeBar',
      payload: e
    })
  }

  // 日志数据处理
  const blockOption = (valueList, textList) => {
    return {
      title: {
        left: 10
      },
      legend: {
        height: 200
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        showDelay: 20
      },
      grid: {
        left: 0,
        top: 0,
        bottom: '20%'
      },
      xAxis: {
        show: false,
        data: textList,
        silent: false,
        splitLine: {
          show: false
        },
        splitArea: {
          show: false
        }
      },
      yAxis: {
        show: false,
        splitArea: {
          show: false
        }
      },
      series: [{
        type: 'line',
        data: valueList,
        // large: true,
        areaStyle: {
          background: '#337ab7',
          color: '#337ab7'
        },
        itemStyle: { // 折线的样式设置
          normal: {
            lineStyle: { // 折线线条的设置
              color: '#337ab7'
            }
          }
        }
      }]
    }
  }

  const blockCardProps1 = {
    title: '今日登录',
    subtitle: '2,251',
    message: `总用户数 ${loginTodayData.total}`,
    option: blockOption(loginTodayData.valueList, loginTodayData.textList)
  }

  const blockCardProps2 = {
    title: '有效会话',
    subtitle: '2,251',
    message: `今日登录 ${effectiveSessionData.total}`,
    option: blockOption(effectiveSessionData.valueList, effectiveSessionData.textList)
  }

  const blockCardProps3 = {
    title: '当前调用',
    subtitle: '251',
    message: `今日调用 ${currentCallData.total}`,
    option: blockOption(currentCallData.valueList, currentCallData.textList)
  }

  const blockCardProps4 = {
    title: '今日变更',
    subtitle: '51',
    message: `今日删除 ${changeTodayData.total}`,
    option: blockOption(changeTodayData.valueList, changeTodayData.textList)
  }

  // console.log('HHHHH', data)

  var barOption = {
    backgroundColor: '#f5f5f5',
    title: {
      left: 10
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      showDelay: 20
    },
    grid2: {
      bottom: 90
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '10%',
      bottom: '90'
    },
    dataZoom: [{
      type: 'inside'
    }, {
      type: 'slider'
    }],
    xAxis: {
      data: barData.textList,
      silent: false,
      splitLine: {
        show: false
      },
      splitArea: {
        show: false
      }
    },
    yAxis: {
      splitArea: {
        show: false
      }
    },
    series: [{
      type: 'line',
      data: barData.valueList,
      large: true,
      areaStyle: {
        background: '#337ab7',
        color: '#337ab7'
      },
      itemStyle: { // 折线的样式设置
        normal: {
          lineStyle: { // 折线线条的设置
            color: '#337ab7'
          }
        }
      }
    }]
  }

  const menu = (
    <Menu>
      <Menu.Item>
        <a>
          删除
        </a>
      </Menu.Item>
    </Menu>
  )

  const loginLogColumns = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '表格使用说明11',
      dataIndex: 'info',
      key: 'info'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '项目上线时间',
      dataIndex: 'time',
      key: 'idtime'
    }
  ]

  const interfaceLogColumns = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '表格使用说明22',
      dataIndex: 'info',
      key: 'info'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '项目上线时间',
      dataIndex: 'time',
      key: 'idtime'
    }
  ]

  const auditLogColumns = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '表格使用说明33',
      dataIndex: 'info',
      key: 'info'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '项目上线时间',
      dataIndex: 'time',
      key: 'idtime'
    }
  ]

  const businessLogColumns = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '表格使用说明44',
      dataIndex: 'info',
      key: 'info'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: '项目上线时间',
      dataIndex: 'time',
      key: 'idtime'
    }
  ]

  const getColumns = (index) => {
    const obj = {
      1: loginLogColumns,
      2: interfaceLogColumns,
      3: auditLogColumns,
      4: businessLogColumns
    }
    return [
      ...obj[index],
      {
        title: '操作',
        key: 'oprate',
        render: () => (
          <span>
            <a>查看</a>
            <Divider type="vertical" />
            <Dropdown overlay={menu}>
              <a href="#">
                更多 <Icon type="down" />
              </a>
            </Dropdown>
          </span>
        )
      }
    ]
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    }
  }

  function getData (index) {
    const obj = {
      1: loginLogList,
      2: interfaceLogList,
      3: auditLogList,
      4: businessLogList
    }
    return obj[index]
  }

  return (
    <div className={`kuu-container ${styles.statics}`}>
      <div className={styles.header}>
        <h3 style={{ fontWeight: '900' }}>系统监控</h3>
        <div className={styles.header_right}>
          <Switch checkedChildren="实时日志" unCheckedChildren="历史日志" defaultChecked onChange={handleSwitch} />
          <div style={{ marginLeft: '1em' }}>
            <Tooltip title="这是一个提示信息">
              <Icon type="question-circle" />
            </Tooltip>
          </div>
        </div>
      </div>

      <div style={{ margin: '1em 0' }}>
        <Row type="flex" justify="space-between" align="middle">
          <Col span={5}>
            <BlockCard {...blockCardProps1} />
          </Col>
          <Col span={5}>
            <BlockCard {...blockCardProps2} />
          </Col>
          <Col span={5}>
            <BlockCard {...blockCardProps3} />
          </Col>
          <Col span={5}>
            <BlockCard {...blockCardProps4} />
          </Col>
        </Row>
      </div>

      <BaseStatic
        style={{
          height: 400,
          margin: '30px 0',
          boxShadow: '0px 4px 10px 0px rgba(159, 170, 195, 0.3)',
          borderRadius: 4
        }}
        option={barOption}
        getDatazoom={getDatazoom}
      />

      <div className={styles.footer}>
        <Radio.Group onChange={handleTabChange} buttonStyle="solid" value={selectIndex} style={{ marginBottom: 8 }}>
          <Radio.Button value="1">登录日志</Radio.Button>
          <Radio.Button value="2">接口日志</Radio.Button>
          <Radio.Button value="3">审计日志</Radio.Button>
          <Radio.Button value="4">业务日志</Radio.Button>
        </Radio.Group>

        <div style={{ padding: '1em' }}>
          <div style={{ display: 'flex', marginBottom: '1em' }}>
            <Input style={{ width: '200px' }} />
            <Button type="primary" style={{ marginLeft: '1em' }}>查询</Button>
          </div>
          <Table
            columns={getColumns(selectIndex)}
            dataSource={getData(selectIndex)}
            loading={false}
            pagination={false}
          />
          <div style={{ margin: '1em 0', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '1em' }}>共搜索到20条数据</span>
              <Pagination
                showQuickJumper
                pageSize={2}
                total={20}
                pageSizeOptions={['10', '20', '30', '40']}
                rowSelection={rowSelection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function mapStateToProps (state) {
  return {
    statics: state.statics
  }
}

export default connect(mapStateToProps)(Statics)
