// index.js
const app = getApp()

Page({
  data: {
    motto: 'Hello Boomerang',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },

  onLoad: function() {
    const token = app.globalData.token;
    const expiredTime = app.globalData.expiredTime;
    const now = new Date();
    
    if (!token || now > expiredTime) {
      wx.reLaunch({
        url: '../login/login',
      });
    }

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  // wxLogin: function() {
  //   //let self = this;
  //   Toast.loading({
  //     mask: true,
  //     message: "登陆中..."
  //   });

  //   wx.login({
  //     success (res) {
  //       if (res.code) {
  //         //发起网络请求
  //         wx.request({
  //           url: `${app.globalData.baseUrl}/users/wechat-sign-in/${res.code}`,
  //           method: "POST",
  //           success: function (response) {
  //             const token = response.data.jwtToken;
  //             const username = response.data.username;
  //             const authorities = response.data.authorities;
  //             const expiredTime = new Date() + 1*1*60*60*1000; //1 hour
  //             wx.setStorageSync('token', token);
  //             wx.setStorageSync('username', username);
  //             wx.setStorageSync('expiredtime', expiredTime);
  //             wx.setStorageSync('authorities', authorities)
  //             app.globalData.token = token;
  //             app.globalData.username = username;
  //             app.globalData.expiredTime = expiredTime;
  //             app.globalData.authorities = authorities;
  //             Toast.clear();
  //             wx.reLaunch({
  //               url: '../index/index',
  //             });
  //           },
  //           fail(err) {
  //             console.log('登录失败！' + err);
  //           }
  //         });
  //       } else {
  //         console.log('登录失败！' + res.errMsg);
  //       }
  //     }
  //   });
  // },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
