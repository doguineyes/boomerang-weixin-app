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
    countryCode:"",
    country: {
      short: "CN",
      name: "中国",
      en: "China",
      tel: "86",
      pinyin: "zg"
    }
  },

  onMobileChange: function(event) {
    this.setData({
      mobile: event.detail,
    });
  },

  onPasswordChange: function(event) {
    this.setData({
      password: event.detail,
    });
  },

  onSignUpClick: function() {
    wx.reLaunch({
      url: '/pages/login/register',
    });
  },

  onLoginClick: function() {
    const that = this;
    this.setData({
      loading: true
    });
    Toast.loading({
      mask: true,
      message: '加载中...'
    });
    const baseUrl = app.globalData.baseUrl;
    const password = this.data.password;
    const mobile = this.data.mobile;
    const areaCode = this.data.country.tel;
    const requestData = {
      "areaCode": areaCode,
      "mobile": mobile,
      "password": password,
    };
    if (!password || !mobile || !areaCode) return;
    wx.request({
      url: `${baseUrl}/users/login/mobile`,
      method: "POST",
      data: requestData,
      success: function(response) {
        if (response.statusCode != 200) {
          return;
        }
        that.saveTokens(response);
      },
      fail(err) {
      },
      complete() {
        Toast.clear();
        that.setData({
          loading: false
        });
      },
    })
  },

  saveTokens: function(response) {
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
    this.setData({
      username: response.data.username,
      token: response.data.jwtToken,
      loggedin: true,
    })
    wx.reLaunch({
      url: '../index/index',
    });
  },

  onWechatQuickLoginClick: function(event) {
    this.setData({
      loading: true
    });

    Toast.loading({
      mask: true,
      message: '加载中...'
    });

    const that = this;

    //Try to quick login with wechat openId
    wx.login({
      success (res) {
        if (res.code) {
          wx.request({
            url: `${app.globalData.baseUrl}/users/login/wechat/${res.code}`,
            method: "POST",
            success: function (response) {
              if (response.statusCode != 200) {
                return;
              }
              that.saveTokens(response);
            },
            fail(err) {
            },
            complete() {
              Toast.clear();
              that.setData({
                loading: false
              });
            },
          })
        } else {
          console.log("Wx login failed, get wechat code error: " + res.errMsg)
        }
      }
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