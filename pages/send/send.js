// pages/send/send.js
import Dialog from "@vant/weapp/dialog/dialog";
import Toast from "@vant/weapp/toast/toast";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sender: {
      name: "",
      mobile: "",
      area: "",
      areaCode: "",
      address: ""
    },
    recipient: {
      name: "",
      mobile: "",
      area: "",
      areaCode: "",
      address: ""
    },
    cargos: [
      {name: "", count: 1},
    ],
  },

  onAddCargoField: function() {
    const size = this.data.cargos.filter(Boolean).length;
    const maxCargoSize = 10;
    if (size >= maxCargoSize) {
      Dialog.alert({
        message: `每个订单至多包含${maxCargoSize}条物品记录`,
      }).then(() => {
        // just close
      });
      return;
    }
    const last = this.data.cargos.length;
    this.setData({
      ["cargos[" + last + "]"]: {name: "", count: 1}
    });
  },

  onCargoNameChange: function(event) {
    const index = event.target.id;
    const name = event.detail;
    this.setCargoName(index, name);
  },

  onCargoNameBlur: function(event) {
    const index = event.target.id;
    const name = event.detail.value;
    this.setCargoName(index, name);
  },

  setCargoName: function(index, name) {
    this.setData({
      ["cargos[" + index + "].name"]: name
    })
  },

  onCargoCountChange: function(event) {
    const index = event.target.id;
    const inputCount = event.detail;
    this.setData({
      ["cargos[" + index + "].count"]: inputCount
    });
  },

  onIncomingCourierNumberChange: function(event) {
    this.setData({
      incomingCourierNumber: event.detail,
    });
  },

  onDeleteCargoRecord: function(event) {
    const { position, instance, name } = event.detail;
    switch (position) {
      case 'left':
        break;
      case 'cell':
        instance.close();
        break;
      case 'right':
        const size = this.data.cargos.filter(Boolean).length;
        if (size <= 1) {
          Dialog.alert({
            message: "至少保留一件物品",
          }).then(() => {
            // just close
          });
          instance.close();
          return;
        }
        Dialog.confirm({
          message: `确定删除${this.data.cargos[parseInt(name)].name}吗？`,
        }).then(() => {
          delete this.data.cargos[parseInt(name)];
          this.setData({cargos: this.data.cargos});
          instance.close();
        }).catch(() => {
          instance.close();
        });
        break;
    }
  },

  onSubmitOrder: function() {
    const toast = Toast.loading({
      mask: true,
      message: '处理中...'
    });
    if (!app.globalData.username) {
      wx.reLaunch({
        url: '../login/login',
      });
    }
    const order = {
      customerName: app.globalData.username,
      incomingCourierNumber: this.data.incomingCourierNumber,
      sender: {
        name: this.data.sender.name,
        mobile: this.data.sender.mobile,
        address: this.data.sender.area + this.data.sender.address
      },
      receiver: {
        name: this.data.recipient.name,
        mobile: this.data.recipient.mobile,
        address: this.data.recipient.area + this.data.sender.address
      },
      cargoRecords: this.data.cargos.filter(Boolean),
    };
    const token = "Bearer " + app.globalData.token;
    const that = this;
    let requestSubscribeMessageTask = new Promise(
      (resolve, reject) => {
        wx.requestSubscribeMessage({
          tmplIds: ["loJMx4AGyLQnmP6WO3l7CfsC549yOzxSKacnO98-ALI", "ws8iZAAPeKzoidhjG4gqYI5IlzFx28OXuejT8kJvOik"],
          success: (res) => {
            if(res["loJMx4AGyLQnmP6WO3l7CfsC549yOzxSKacnO98-ALI"] === "accept") {
              resolve("loJMx4AGyLQnmP6WO3l7CfsC549yOzxSKacnO98-ALI");
            } else {
              reject("loJMx4AGyLQnmP6WO3l7CfsC549yOzxSKacnO98-ALI");
            }
          },
          fail(res) {
            console.log(res);
            reject(res);
          }
        });
      }
    );
    requestSubscribeMessageTask.then(
      (response) => {
        wx.request({
          url: `${app.globalData.baseUrl}/orders`,
          method: "POST",
          data: order,
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success(res) {
            Toast.clear();
            wx.redirectTo({
              url: './success',
            })
          },
          fail(err) {
            Toast.clear();
            // if (res.data.code != 200) {
            //   app.globalData.appController.callhandler(res.data);
            //   return;
            // }
          }
        });
      }
    );
  },

  clearOrderData: function() {
    this.setData({
      sender: {
        name: "",
        mobile: "",
        area: "",
        areaCode: "",
        address: ""
      },
      recipient: {
        name: "",
        mobile: "",
        area: "",
        areaCode: "",
        address: ""
      },
      cargos: [
        {name: "", count: 1},
      ],
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const token = app.globalData.token;
    const expiredTime = app.globalData.expiredTime;
    const userName = app.globalData.username;
    const now = new Date();
    
    if (!token || now > expiredTime || !userName) {
      wx.reLaunch({
        url: '../login/login',
      })
    }
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
    const token = app.globalData.token;
    const expiredTime = app.globalData.expiredTime;
    const userName = app.globalData.username;
    const now = new Date();
    
    if (!token || now > expiredTime || !userName) {
      wx.reLaunch({
        url: '../login/login',
      })
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