// pages/login/register.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    countryCode:"",
    country: {
      short: "CN",
      name: "中国",
      en: "China",
      tel: "86",
      pinyin: "zg"
    },
    mobileErrorMessage: "",
    countDown: 0,
    disableGetSmsCodeBtn: false,
  },

  onMobileChange: function(event) {
    this.setData({
      mobile: event.detail,
    });
  },

  onGetSmsVerificationCode: function(event) {
    if (!this.data.mobile || !this.data.country) return;
    this.setData({
      countDown: 60,
      disableGetSmsCodeBtn: true,
    });
    const counter = setInterval(() => {
      this.setData({
        countDown: this.data.countDown-1,
      });
      if (this.data.countDown <= 0) {
        this.setData({
          countDown: 0,
          disableGetSmsCodeBtn: false,
        });
        clearInterval(counter);
      }
    }, 1000);
    const baseUrl = app.globalData.baseUrl;
    const areaCode = this.data.country.tel;
    const mobile = this.data.mobile;
    wx.request({
      url: `${baseUrl}/users/sms-verify-code/${areaCode}/${mobile}`,
      method: "POST",
      success: function(response) {
      },
      fail: function(error) {
      },
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      countryCode: `${this.data.country.name} ${this.data.country.tel}`
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
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];
    //console.log(currPage.__data__.country.v);
    if (currPage.__data__.country) {
      this.setData({
        countryCode: currPage.__data__.country.v,
        country: currPage.__data__.country
      });
    }
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