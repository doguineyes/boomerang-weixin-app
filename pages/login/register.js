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
    countDown: 0,
    disableGetSmsCodeBtn: false,
  },

  onMobileChange: function(event) {
    this.setData({
      mobile: event.detail,
      mobileErrorMessage: "",
    });
  },

  onMobileBlur: function(event) {
    this.setData({
      mobile: event.detail.value,
      mobileErrorMessage: "",
    });
  },

  onMobileFocus: function(event) {
    this.setData({
      mobile: event.detail.value,
      mobileErrorMessage: "",
    });
  },

  onVerifycodeChange: function(event) {
    this.setData({
      verifyCode: event.detail,
    });
  },

  onVerifyCodeFocus: function(event) {
    this.setData({
      verifyCode: event.detail.value,
      verifyCodeErrorMessage: "",
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
    });
  },

  onRePasswordChange: function(event) {
    this.setData({
      rePassword: event.detail,
    })
  },

  onRePasswordFocus: function(event) {
    this.setData({
      rePassword: event.detail.value,
      rePasswordErrorMessage: "",
    });
  },

  onSubmit: function() {
    let somethingWrong = false;
    if (!this.data.mobile) {
      somethingWrong = true;
      this.setData({
        mobileErrorMessage: "请输入手机号",
      });
    }
    if (this.data.mobile.length < 5 || this.data.mobile.length >= 15 || !/^\d+$/.test(this.data.mobile)) {
      somethingWrong = true;
      this.setData({
        mobileErrorMessage: "手机号格式错误",
      });
    }
    if (!this.data.verifyCode) {
      somethingWrong = true;
      this.setData({
        verifyCodeErrorMessage: "请输入验证码",
      });
    }
    if (this.data.verifyCode.length != 6 || !/^\d+$/.test(this.data.verifyCode)) {
      somethingWrong = true;
      this.setData({
        verifyCodeErrorMessage: "验证码格式错误",
      });
    }
    if (!this.data.password) {
      somethingWrong = true;
      this.setData({
        passwordErrorMessage: "请输入密码",
      });
    }
    if (this.data.password.length <= 5) {
      somethingWrong = true;
      this.setData({
        passwordErrorMessage: "密码位数太短",
      });
    }
    if (!this.data.rePassword) {
      somethingWrong = true;
      this.setData({
        rePasswordErrorMessage: "请再次输入密码",
      });
    }
    if (this.data.password !== this.data.rePassword) {
      somethingWrong = true;
      this.setData({
        rePasswordErrorMessage: "两次输入密码不一致",
      });
    }
    if (somethingWrong) return;

    const that = this;
    new Promise((resolve, reject) => {
      wx.login({
        success: function(res) {
          resolve(res.code);
        }
      });
    })
    .then((code) => {
      const baseUrl = app.globalData.baseUrl;
      wx.request({
        url: `${baseUrl}/users/register/wechat/${code}`,
        method: "POST",
        data: {
          "areaCode": this.data.country.tel,
          "mobile": this.data.mobile,
          "password": this.data.password,
          "smsVerificationCode": this.data.verifyCode,
        },
        success: function(response) {
          if (response.statusCode == 400) {
            that.setData({
              verifyCodeErrorMessage: "验证码错误",
            });
            return;
          }
          if (response.statusCode == 403) {
            that.setData({
              mobileErrorMessage: "手机号已注册",
            });
            return;
          }
          if (response.statusCode == 200) {
            that.saveTokens(response);
          }
        },
        fail: function(error) {

        },
      })
    });
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

  onGetSmsVerificationCode: function() {
    if (!this.data.country) return;
    if (!this.data.mobile) {
      this.setData({
        mobileErrorMessage: "请输入手机号",
      });
      return;
    }
    if (this.data.mobile.length < 5 || this.data.mobile.length >= 15 || !/^\d+$/.test(this.data.mobile)) {
      this.setData({
        mobileErrorMessage: "手机号格式错误",
      });
      return;
    }
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
      method: "GET",
      success: function(response) {
        if (response.statusCode == 429) {
          that.setData({
            mobileErrorMessage: "请求次数过多",
          });
        }
        if (response.statusCode != 200) {
          that.setData({
            mobileErrorMessage: "出现了一些错误",
          })
        }
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