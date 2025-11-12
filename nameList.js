Page({
  data: {
    nameList: [],
    inputName: ''
  },

  onLoad() {
    this.loadNameList()
  },

  onShow() {
    this.loadNameList()
  },

  loadNameList() {
    const nameList = wx.getStorageSync('nameList') || []
    this.setData({ nameList })
  },

  onInputChange(e) {
    this.setData({
      inputName: e.detail.value
    })
  },

  addName() {
    const { inputName, nameList } = this.data
    
    if (!inputName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    // 检查是否已存在
    const exists = nameList.some(item => item.name === inputName.trim())
    if (exists) {
      wx.showToast({
        title: '该姓名已存在',
        icon: 'none'
      })
      return
    }
    
    // 生成新ID
    const newId = nameList.length > 0 ? Math.max(...nameList.map(item => item.id)) + 1 : 1
    
    // 添加新人员
    // 在 nameList.js 的 addName 函数中修改这一行：
const newList = [
  ...nameList,
  {
    id: newId,
    name: inputName.trim(),
    selected: false,
    attendance: ''  // 新增签到状态字段
  }
]
    
    wx.setStorageSync('nameList', newList)
    this.setData({
      nameList: newList,
      inputName: ''
    })
    
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    })
  },

  editName(e) {
    const index = e.currentTarget.dataset.index
    const { nameList } = this.data
    const currentName = nameList[index].name
    
    wx.showModal({
      title: '编辑姓名',
      content: '',
      editable: true,
      placeholderText: currentName,
      success: (res) => {
        if (res.confirm && res.content) {
          const newName = res.content.trim()
          if (!newName) {
            wx.showToast({
              title: '姓名不能为空',
              icon: 'none'
            })
            return
          }
          
          // 检查是否已存在（排除自己）
          const exists = nameList.some((item, i) => i !== index && item.name === newName)
          if (exists) {
            wx.showToast({
              title: '该姓名已存在',
              icon: 'none'
            })
            return
          }
          
          const updatedList = [...nameList]
          updatedList[index].name = newName
          
          wx.setStorageSync('nameList', updatedList)
          this.setData({ nameList: updatedList })
          
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          })
        }
      }
    })
  },

  deleteName(e) {
    const index = e.currentTarget.dataset.index
    const { nameList } = this.data
    const nameToDelete = nameList[index].name
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${nameToDelete}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const updatedList = nameList.filter((_, i) => i !== index)
          wx.setStorageSync('nameList', updatedList)
          this.setData({ nameList: updatedList })
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          })
        }
      }
    })
  },

  importNames() {
    wx.showModal({
      title: '批量导入',
      content: '请输入姓名，每行一个',
      editable: true,
      placeholderText: '张三\n李四\n王五',
      success: (res) => {
        if (res.confirm && res.content) {
          const names = res.content.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0)
          
          if (names.length === 0) {
            wx.showToast({
              title: '未输入有效姓名',
              icon: 'none'
            })
            return
          }
          
          const existingList = wx.getStorageSync('nameList') || []
          let nextId = existingList.length > 0 ? Math.max(...existingList.map(item => item.id)) + 1 : 1
          
          const newNames = []
          names.forEach(name => {
            // 检查是否已存在
            if (!existingList.some(item => item.name === name)) {
              newNames.push({
                id: nextId++,
                name: name,
                selected: false
              })
            }
          })
          
          if (newNames.length === 0) {
            wx.showToast({
              title: '所有姓名都已存在',
              icon: 'none'
            })
            return
          }
          
          const updatedList = [...existingList, ...newNames]
          wx.setStorageSync('nameList', updatedList)
          this.setData({ nameList: updatedList })
          
          wx.showToast({
            title: `成功导入${newNames.length}人`,
            icon: 'success'
          })
        }
      }
    })
  },

  exportNames() {
    const { nameList } = this.data
    
    if (nameList.length === 0) {
      wx.showToast({
        title: '名单为空',
        icon: 'none'
      })
      return
    }
    
    const nameText = nameList.map(item => item.name).join('\n')
    
    wx.showModal({
      title: '名单导出',
      content: nameText,
      showCancel: false,
      confirmText: '复制',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: nameText,
            success: () => {
              wx.showToast({
                title: '已复制到剪贴板',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空整个名单吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('nameList', [])
          this.setData({ nameList: [] })
          
          wx.showToast({
            title: '已清空名单',
            icon: 'success'
          })
        }
      }
    })
  }
})