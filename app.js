App({
  onLaunch() {
    // 初始化名单数据
    const nameList = wx.getStorageSync('nameList') || []
    if (nameList.length === 0) {
      // 如果没有数据，初始化一些示例数据
      const defaultList = [
        { id: 1, name: '张三', selected: false },
        { id: 2, name: '李四', selected: false },
        { id: 3, name: '王五', selected: false },
        { id: 4, name: '赵六', selected: false },
        { id: 5, name: '钱七', selected: false }
      ]
      wx.setStorageSync('nameList', defaultList)
    }
  },
  globalData: {
    userInfo: null
  }
})