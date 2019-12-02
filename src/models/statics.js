export default {
  state: {
    selectIndex: '1',
    loginTodayData: { // 今日登录
      total: 1500,
      valueList: [200, 232, 301, 434, 590, 330, 220],
      textList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    effectiveSessionData: { // 有效会话
      total: 1850,
      valueList: [200, 132, 201, 234, 200, 330, 220],
      textList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    currentCallData: { // 当前调用
      total: 1960,
      valueList: [180, 232, 251, 234, 300, 200, 320],
      textList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    changeTodayData: { // 今日变更
      total: 1280,
      valueList: [200, 232, 201, 234, 200, 270, 230],
      textList: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    barData: {
      textList: [
        '2001',
        '2002',
        '2003',
        '2004',
        '2005',
        '2006',
        '2007',
        '2008',
        '2009',
        '2010',
        '2011',
        '2012',
        '2013',
        '2014',
        '2015',
        '2016'
      ],
      valueList: [
        '3832.00',
        '3632.00',
        '3532.00',
        '3732.00',
        '3432.00',
        '3232.00',
        '3132.00',
        '3932.00',
        '3332.00',
        '3032.00',
        '3032.00',
        '3032.00',
        '3032.00',
        '3032.00',
        '3032.00',
        '3032.00'
      ]
    },
    loginLogList: [
      {
        id: 1,
        info: '11111',
        status: '审批通过',
        time: '2016-09-21 08:50:08'
      },
      {
        id: 2,
        info: '2222',
        status: '审批中',
        time: '2016-09-21 08:50:08'
      }
    ],
    interfaceLogList: [
      {
        id: 3,
        info: '33333',
        status: '审批通过',
        time: '2016-09-21 08:50:08'
      },
      {
        id: 4,
        info: '44444',
        status: '审批中',
        time: '2016-09-21 08:50:08'
      }
    ],
    auditLogList: [
      {
        id: 5,
        info: '55555',
        status: '审批通过',
        time: '2016-09-21 08:50:08'
      },
      {
        id: 6,
        info: '6666',
        status: '审批中',
        time: '2016-09-21 08:50:08'
      }
    ],
    businessLogList: [
      {
        id: 7,
        info: '77777',
        status: '审批通过',
        time: '2016-09-21 08:50:08'
      },
      {
        id: 8,
        info: '88888',
        status: '审批中',
        time: '2016-09-21 08:50:08'
      }
    ]
  },

  effects: {
    // 切换日志
    * changeLog ({ payload }, { call, put }) {
      console.log('111', payload)
    },

    * changeBar ({ payload }, { call, put }) {
      console.log('222', payload)
    }
  },

  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }

}
