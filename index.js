Page({
  data: {
    nameList: [],
    selectedName: '',
    isRolling: false,
    rollInterval: null,
    totalCount: 0,
    presentCount: 0,
    remainingCount: 0
  },

  onLoad() {
    this.loadNameList()
  },

  onShow() {
    this.loadNameList()
  },

  loadNameList() {
    const nameList = wx.getStorageSync('nameList') || []
    const presentCount = nameList.filter(item => item.attendance === 'present').length
    const selectedCount = nameList.filter(item => item.selected).length
    
    this.setData({
      nameList,
      totalCount: nameList.length,
      presentCount,
      remainingCount: nameList.length - selectedCount
    })
  },

  startRollCall() {
    const { nameList, isRolling } = this.data
    
    if (isRolling) return
    
    // 检查是否还有未抽中学生
    const availableNames = nameList.filter(item => !item.selected)
    if (availableNames.length === 0) {
      wx.showToast({
        title: '所有学生都已抽过',
        icon: 'none'
      })
      return
    }

    this.setData({ isRolling: true, selectedName: '' })
    
    // 开始随机滚动效果
    let counter = 0
    this.data.rollInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableNames.length)
      this.setData({
        selectedName: availableNames[randomIndex].name
      })
      counter++
    }, 100)
  },

  stopRollCall() {
    const { nameList, rollInterval, selectedName } = this.data
    
    if (rollInterval) {
      clearInterval(rollInterval)
    }
    
    this.setData({ isRolling: false })
    
    // 标记选中的学生
    if (selectedName) {
      const updatedList = nameList.map(item => {
        if (item.name === selectedName) {
          return { ...item, selected: true }
        }
        return item
      })
      
      wx.setStorageSync('nameList', updatedList)
      this.loadNameList()
      
      // 显示选中提示
      wx.showToast({
        title: `抽中: ${selectedName}`,
        icon: 'success'
      })
    }
  },

  selectFromPresent() {
    const { nameList } = this.data
    
    // 获取已到且未抽中的学生
    const availableNames = nameList.filter(item => 
      item.attendance === 'present' && !item.selected
    )
    
    if (availableNames.length === 0) {
      wx.showToast({
        title: '没有可用的已到学生',
        icon: 'none'
      })
      return
    }
    
    // 随机选择一名学生
    const randomIndex = Math.floor(Math.random() * availableNames.length)
    const selectedStudent = availableNames[randomIndex]
    
    // 标记为已抽中
    const updatedList = nameList.map(item => {
      if (item.id === selectedStudent.id) {
        return { ...item, selected: true }
      }
      return item
    })
    
    wx.setStorageSync('nameList', updatedList)
    this.setData({
      selectedName: selectedStudent.name,
      nameList: updatedList
    })
    
    this.loadNameList()
    
    wx.showToast({
      title: `抽中: ${selectedStudent.name}`,
      icon: 'success'
    })
  }
})