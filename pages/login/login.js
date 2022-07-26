// pages/login/login.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from "@vant/weapp/dialog/dialog";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
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

  onMobileFocus: function(event) {
    this.setData({
      mobile: event.detail.value,
      mobileErrorMessage: "",
    });
  },

  onPasswordChange: function(event) {
    this.setData({
      password: event.detail,
    });
  },

  onPasswordFocus: function(event) {
    this.setData({
      password: event.detail.value,
      passwordErrorMessage: "",
    })
  },

  onServiceTerms: function() {
    wx.redirectTo({
      url: '/pages/login/service-terms',
    })
  },

  onPrivacyPolicy: function() {
    wx.redirectTo({
      url: '/pages/login/privacy-policy',
    })
  },

  onSignUpClick: function() {
    wx.reLaunch({
      url: '/pages/login/register',
    });
  },

  onResetPasswordClick: function() {
    wx.reLaunch({
      url: '/pages/login/reset-passwd',
    });
  },

  onLoginClick: function() {
    let somethingWrong = false;
    if (!this.data.mobile || this.data.mobile.length < 5 || this.data.mobile.length > 15 || !/^\d+$/.test(this.data.mobile)) {
      this.setData({
        mobileErrorMessage: "手机号格式错误",
      });
      somethingWrong = true;
    }
    if (!this.data.password || this.data.password.length < 6) {
      this.setData({
        passwordErrorMessage: "密码太短",
      });
      somethingWrong = true;
    }
    if (somethingWrong) return;

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
    wx.request({
      url: `${baseUrl}/users/login/mobile`,
      method: "POST",
      data: requestData,
      success: function(response) {
        if (response.statusCode != 200) {
          Dialog.alert({
            message: "登录失败",
          }).then(() => {
            // on close
          });
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
    const entryCode = response.data.entryCode;
    const expiredTime = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)); //30 days
    wx.setStorageSync('token', token);
    wx.setStorageSync('username', username);
    wx.setStorageSync('expiredtime', expiredTime);
    wx.setStorageSync('authorities', authorities);
    wx.setStorageSync('entryCode', entryCode);
    app.globalData.token = token;
    app.globalData.username = username;
    app.globalData.expiredTime = expiredTime;
    app.globalData.authorities = authorities;
    app.globalData.entryCode = entryCode;
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
              if (response.statusCode == 401 || response == 404) {
                Dialog.alert({
                  message: "微信没有绑定账号请先注册",
                }).then(() => {
                  // on close
                });
              }
              if (response.statusCode == 200) {
                that.saveTokens(response);
              }
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
    if (currPage.__data__.country) {
      this.setData({
        countryCode: `${currPage.__data__.country.name} ${currPage.__data__.country.tel}`,
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