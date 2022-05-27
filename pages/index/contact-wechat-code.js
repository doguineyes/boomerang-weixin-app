// pages/index/contact-wechat-code.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    wechatCodes: [
      "../static/contact_1.jpeg",
      "../static/contact_2.jpeg",
      "../static/contact_3.jpeg",
      "../static/contact_4.jpeg",
    ],
    url: "../static/contact_1.jpeg",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const id = options.id;
    const target = this.data.wechatCodes[id] || this.data.wechatCodes[0];
    this.setData({
      url: target,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})