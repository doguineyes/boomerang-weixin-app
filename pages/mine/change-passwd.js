// pages/mine/change-passwd.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from "@vant/weapp/dialog/dialog";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onOldPasswordChange: function(event) {
    this.setData({
      oldPassword: event.detail,
      oldPasswordErrorMessage: "",
    });
  },

  onOldPasswordFocus: function(event) {
    this.setData({
      oldPassword: event.detail.value,
      oldPasswordErrorMessage: "",
    });
  },

  onPasswordChange: function(event) {
    this.setData({
      password: event.detail,
      passwordErrorMessage: "",
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
      rePasswordErrorMessage: "",
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
    if (!this.data.oldPassword) {
      somethingWrong = true;
      this.setData({
        oldPasswordErrorMessage: "请输入旧密码",
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

    const baseUrl = app.globalData.baseUrl;
    const token = "Bearer " + app.globalData.token;
    new Promise(
      (resolve, reject) => {
        wx.request({
          url: `${baseUrl}/users/change-my-passwd`,
          method: "POST",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          data: {
            oldPassword: this.data.oldPassword,
            newPassword: this.data.password,
          },
          success: (response) => {
            if (response.statusCode === 401) {
              this.setData({
                oldPasswordErrorMessage: "旧密码错误，请重新输入",
              });
              reject(response);
            }
            if (response.statusCode != 200) {
              reject(response);
            }
            resolve(response);
          },
          fail : (error) => {
            reject(error);
          }
        })
      }
    )
    .then(
      () => {
        return Dialog.alert({
          message: "密码修改成功，请用新密码登录",
        });
      }
    )
    .then(
      () => {
        wx.reLaunch({
          url: '/pages/login/login',
        });
      }
    )
    .catch(
      () => {
        Toast.fail("密码修改失败");
      }
    );
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