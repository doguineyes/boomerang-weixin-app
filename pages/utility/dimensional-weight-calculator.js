// pages/utility/dimensional-weight-calculator.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onCalculate: function() {
    let somethingError = false;
    if (!this.data?.length) {
      this.setData({
        lengthErrorMessage: "请输入长度（单位:厘米）"
      });
      somethingError = true;
    } else if (this.data.length <= 0) {
      this.setData({
        lengthErrorMessage: "长度需要大于0"
      });
      somethingError = true;
    }
    if (!this.data?.width) {
      this.setData({
        widthErrorMessage: "请输入宽度（单位:厘米）"
      });
      somethingError = true;
    } else if (this.data.width <= 0) {
      this.setData({
        widthErrorMessage: "宽度需要大于0"
      });
      somethingError = true;
    }
    if (!this.data?.high) {
      this.setData({
        highErrorMessage: "请输入高度（单位:厘米）"
      });
      somethingError = true;
    } else if (this.data.high <= 0) {
      this.setData({
        highErrorMessage: "高度需要大于0"
      });
      somethingError = true;
    }
    if (somethingError) return;
    const weight = this.data.length * 1.3 * this.data.width * 1.3 * this.data.high * 1.3 / 6000;
    this.setData({
      weight,
    });
  },

  onLengthChange: function (event) {
    this.setData({
      length: event.detail,
      lengthErrorMessage: "",
      weight: "",
    });
  },

  onWidthChange: function (event) {
    this.setData({
      width: event.detail,
      widthErrorMessage: "",
      weight: "",
    });
  },

  onHighChange: function (event) {
    this.setData({
      high: event.detail,
      highErrorMessage: "",
      weight: "",
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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