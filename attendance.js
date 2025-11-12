Page({
  data: {
    nameList: [],
    stats: {
      present: 0,
      absent: 0,
      leave: 0,
      total: 0
    },
    attendanceStatus: '未开始'
  },

  onLoad() {
    this.loadNameList()
  },

  onShow() {
    this.loadNameList()
  },

  loadNameList() {
    let nameList = wx.getStorageSync('nameList') || []
    
    // 初始化签到状态
    nameList = nameList.map(item => {
      if (!item.attendance) {
        return { ...item, attendance: '' }
      }
      return item
    })
    
    this.calculateStats(nameList)
    this.setData({ nameList })
  },

  calculateStats(nameList) {
    const stats = {
      present: nameList.filter(item => item.attendance === 'present').length,
      absent: nameList.filter(item => item.attendance === 'absent').length,
      leave: nameList.filter(item => item.attendance === 'leave').length,
      total: nameList.length
    }
    
    const completed = stats.present + stats.absent + stats.leave
    let status = '未开始'
    if (completed > 0) {
      status = `进行中 (${completed}/${stats.total})`
      if (completed === stats.total) {
        status = '已完成'
      }
    }
    
    this.setData({ 
      stats,
      attendanceStatus: status
    })
  },

  startAttendance() {
    wx.showToast({
      title: '开始签到',
      icon: 'success'
    })
  },

  resetAttendance() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有签到状态吗？',
      success: (res) => {
        if (res.confirm) {
          let nameList = wx.getStorageSync('nameList') || []
          nameList = nameList.map(item => ({
            ...item,
            attendance: ''
          }))
          
          wx.setStorageSync('nameList', nameList)
          this.loadNameList()
          
          wx.showToast({
            title: '已重置签到',
            icon: 'success'
          })
        }
      }
    })
  },

  markAttendance(e) {
    const { id, status } = e.currentTarget.dataset
    const { nameList } = this.data
    
    const updatedList = nameList.map(item => {
      if (item.id === id) {
        return { ...item, attendance: status }
      }
      return item
    })
    
    wx.setStorageSync('nameList', updatedList)
    this.calculateStats(updatedList)
    this.setData({ nameList: updatedList })
    
    const statusText = {
      present: '已到',
      absent: '旷课',
      leave: '请假'
    }[status]
    
    const student = nameList.find(item => item.id === id)
    wx.showToast({
      title: `${student.name} ${statusText}`,
      icon: 'success'
    })
  }
})