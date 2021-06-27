// pages/login/login.js
import Toast from '@vant/weapp/toast/toast';

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // loggedin: false,
    loading: false,
  },

  /**
   * 点击微信登陆按钮
   */
  onLoginClick: function () {
    let that = this;

    this.setData({
      loading: true
    });

    const toast = Toast.loading({
      mask: true,
      message: '加载中...'
    });

    wx.login({
      success (res) {
        if (res.code) {
          //发起网络请求
          wx.request({
            url: `${app.globalData.baseUrl}/users/wechat-sign-in/${res.code}`,
            method: "POST",
            success: function (response) {
              Toast.clear();
              that.setData({
                loading: false
              });
              const token = response.data.jwtToken;
              const username = response.data.username;
              const authorities = response.data.authorities;
              const expiredTime = new Date() + 1*1*60*60*1000; //1 hour
              wx.setStorageSync('token', token);
              wx.setStorageSync('username', username);
              wx.setStorageSync('expiredtime', expiredTime);
              wx.setStorageSync('authorities', authorities)
              app.globalData.token = token;
              app.globalData.username = username;
              app.globalData.expiredTime = expiredTime;
              app.globalData.authorities = authorities;

              that.setData({
                username: response.data.username,
                token: response.data.jwtToken,
                loggedin: true
              })
              wx.reLaunch({
                url: '../index/index',
              });
            },
            fail(err) {
              Toast.clear();
              that.setData({
                loading: false
              });
            }
          })

        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    })
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