// pages/orders/stages/newOrder.js
import Toast from "@vant/weapp/toast/toast";
import Dialog from "@vant/weapp/dialog/dialog";
import {getOrder} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  afterArrivalPhotoRead(event) {
    const { file } = event.detail;
    const lastIndex = this.data.order.arrivalPhotos.length;
    const self = this;
    wx.compressImage({
      src: file.url,
      quality: 1,
      success: function(res) {
        self.setData({
          [`order.arrivalPhotos[${lastIndex}].url`]: res.tempFilePath,
          [`order.arrivalPhotos[${lastIndex}].isImage`]: true,
        });
      },
      fail: function() {
        self.setData({
          [`order.arrivalPhotos[${lastIndex}].url`]: file.url,
          [`order.arrivalPhotos[${lastIndex}].isImage`]: true,
        });
      },
    });
  },

  onDeleteArrivalPhoto(event) {
    const index = event.detail.index;
    this.data.order.arrivalPhotos.splice(index, 1);
    this.setData({
      ["order.arrivalPhotos"]: this.data.order.arrivalPhotos,
    });
  },

  onSaveAndNotifyCustomerOrderArrival: function() {
    this.setData({
      submitting: true,
    });
    Toast.loading({
      message: "正在提交",
      forbidClick: true,
    });
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;

    const tasks = [];
    for (let [index, arrivalPhoto] of this.data.order.arrivalPhotos.entries()) {
      self.setData({
        [`order.arrivalPhotos[${index}].status`]: "uploading",
      });
      let uploadArrivalPhotoTask = new Promise(
        (resolve, reject) => {
          wx.uploadFile({
            url: `${baseUrl}/orders/${orderId}/arrival-photos`,
            filePath: arrivalPhoto.url,
            header: {
              "Authorization": token
            },
            name: "photo",
            success: function(res) {
              if (res.statusCode != 200) {
                reject(res);
              }
              const response = JSON.parse(res.data);
              self.setData({
                [`order.arrivalPhotos[${index}].id`]: response.id,
                [`order.arrivalPhotos[${index}].originUrl`]: response.url,
                [`order.arrivalPhotos[${index}].status`]: "done",
              });
              resolve(response);
            },
            fail: function(err) {
              reject(err);
            }
          });
        }
      );
      tasks.push(uploadArrivalPhotoTask);
    }

    Promise.all(tasks)
    .then(
      () => {
        return new Promise(
          (resolve, reject) => {
            wx.request({
              url: `${baseUrl}/orders/${orderId}/notify-arrival`,
              method: "GET",
              header: {
                "content-type": "application/json",
                "Authorization": token
              },
              success: function(res) {
                resolve(res);
              },
              fail: function(err) {
                resolve(err);
              },
            });
          });
      }
    )
    .then(() => {
      return Dialog.alert({
        message: "订单修改提交完毕",
      });
    })
    .then(() => {
      // on close
      self.setData({
        submitting: false,
      });
      wx.switchTab({
        url: "../orders"
      });
    });
  },

  setOrder(newOrder) {
    this.setData({
      order: newOrder,
    });
    const orderStatusName = getOrderStatusName(newOrder);
    this.setData({
      ["order.orderStatusName"]: orderStatusName,
      ["idCardPhotos.front[0].isImage"]: true,
      ["idCardPhotos.front[0].status"]: "uploading",
      ["idCardPhotos.reverse[0].isImage"]: true,
      ["idCardPhotos.reverse[0].status"]: "uploading",
    });
  },

  setIdCardPhoto(photo, side) {
    if (side === "front") {
      this.setData({
        ["idCardPhotos.front[0].url"]: photo.tempFilePath,
        ["idCardPhotos.front[0].status"]: "done",
      });
    } else if (side === "reverse") {
      this.setData({
        ["idCardPhotos.reverse[0].url"]: photo.tempFilePath,
        ["idCardPhotos.reverse[0].status"]: "done",
      });
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.isAdmin()) {
      this.setData({
        isAdmin: true,
      });
    } else {
      this.setData({
        isAdmin: false,
      });
    }
    const id = options.orderId;
    this.setData({
      ["order.id"]: id,
    });

    const tasks = getOrder(id, this.setOrder, this.setIdCardPhoto);

    Promise.all(tasks)
    .then(
      () => {
        Toast.success("加载完成");
      }
    );
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

  },
})