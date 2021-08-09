// pages/orders/stages/newOrder.js
import Toast from "@vant/weapp/toast/toast";
import Dialog from "@vant/weapp/dialog/dialog";
import {getOrderPromise, getPhotosPromise} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {
    },
  },

  onAfterReadPhoto: function(event) {
    const { file } = event.detail.detail;
    const cargoIndex = event.detail.target.id;
    const photoIndex = this.data.order.cargoRecords[cargoIndex].photos.length;
    this.setData({
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].url`]: file.url,
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].isImage`]: true,
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].type`]: "new",
    });
  },

  onDeletePhoto: function(event) {
    const cargoIndex = event.detail.target.id;
    const photoIndex = event.detail.detail.index;
    const order = this.data.order;
    const cargo = order.cargoRecords[cargoIndex];
    const photo = cargo.photos[photoIndex];
    const baseUrl = app.globalData.baseUrl;
    if (photo.type === "original") {
      const queryUrl = `${baseUrl}/orders/${order.id}/cargos/${cargo.id}/photos/${photo.id}`;
      const needToBeDeleteIndex = this.data.photosNeedToBeDeletedRemotely ? this.data.photosNeedToBeDeletedRemotely.length : 0;
      this.setData({
        [`photosNeedToBeDeletedRemotely[${needToBeDeleteIndex}].queryUrl`]: queryUrl,
      });
    }
    cargo.photos.splice(photoIndex, 1);
    this.setData({
      [`order.cargoRecords[${cargoIndex}].photos`]: cargo.photos, 
    });
  },

  onOrderPackagePriceChange: function (event) {
    const orderPropName = event.detail.target.id;
    const orderPropValue = event.detail.detail;
    this.setData({
      [`order.${orderPropName}`]: orderPropValue,
    });
    this.calculateTheTotalPrice();
  },

  onQuitEditing: function() {
    Dialog.confirm({
      message: "是否放弃修改",
    })
    .then(() => {
      wx.switchTab({
        url: '../orders'
      });
    })
    .catch(() => {
    });
  },

  onSaveAndNoticePayment: function() {
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    this.submitSaveTasks()
    .then(() => {
        return new Promise((resolve, reject) => {
          wx.request({
            url: `${baseUrl}/orders/${orderId}/notify-pay`,
            method: "PUT",
            header: {
              "content-type": "application/json",
              "Authorization": token
            },
            success: function(res) {
              resolve(res);
            },
            fail: function(err) {
              reject(err);
            }
          });
        });
      }
    )
    .then(() => {
      // for (let response of responses) {
      //   console.log(response);
      // }
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

  onSave: function() {
    const self = this;
    this.submitSaveTasks()
    .then(() => {
      // for (let response of responses) {
      //   console.log(response);
      // }
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

  submitSaveTasks: function() {
    this.setData({
      submitting: true,
    });
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;

    let tasks = [];

    const orderFeeListUpdateQuery = `${baseUrl}/orders/${orderId}/fees`;
    let orderFeeListUpdateTask = new Promise((resolve, reject) => {
      wx.request({
        url: orderFeeListUpdateQuery,
        method: "PUT",
        data: self.data.order.feeList,
        header: {
          "content-type": "application/json",
          "Authorization": token
        },
        success: function(res) {
          resolve(res);
        },
        fail: function(err) {
          reject(err);
        }
      });
    });
    tasks.push(orderFeeListUpdateTask);
    
    for (let photoNeedToBeDelete of (this.data.photosNeedToBeDeletedRemotely || [])) {
      let photoDeleteTask = new Promise((resolve, reject) => {
        wx.request({
          url: photoNeedToBeDelete.queryUrl,
          method: "Delete",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            resolve(res);
          },
          fail: function(err) {
            reject(err);
          }
        });
      });
      tasks.push(photoDeleteTask);
    }

    for (let [cargoIndex, cargo] of Object.entries(this.data.order.cargoRecords)) {
      const cargoId = cargo.id;
      const uploadUrl = `${baseUrl}/orders/${orderId}/cargos/${cargoId}/photos`;
      for (let [photoIndex, photo] of Object.entries(cargo.photos)) {
        if (photo.type === "new") {
          this.setData({
            [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "uploading",
          });
          let uploadTask = new Promise(
            (resolve, reject) => {
              wx.uploadFile({
                url: uploadUrl,
                filePath: photo.url,
                header: {
                  "Authorization": token
                },
                name: "photo",
                success: function(res) {
                  if (res.statusCode === 200) {
                    const response = JSON.parse(res.data);
                    self.setData({
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].id`]: response.id,
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].originPath`]: response.url,
                      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}].status`]: "done",
                    });
                    resolve(response);
                  }
                },
                fail: function(err) {
                  reject(err);
                }
              });
            }
          );
          tasks.push(uploadTask);
        }
      }
    }

    return Promise.all(tasks);
  },

  calculateTheTotalPrice: function() {
    if (!this.data.order.feeList) return;
    const feeList = this.data.order.feeList;
    const total = (Number.parseFloat(feeList.packingFeeInCent) || 0.0) + (Number.parseFloat(feeList.expressFeeInCent) || 0.0) + (Number.parseFloat(feeList.taxesInCent) || 0.0) + (Number.parseFloat(feeList.insuranceInCent) || 0.0);
    this.setData({
      ["order.feeList.totalCostInCent"]: total,
    });
  },

  setPhotoOk: function(cargoIndex, photoIndex, photo) {
    this.setData({
      [`order.cargoRecords[${cargoIndex}].photos[${photoIndex}]`]: photo,
    });
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

    getOrderPromise(id).then(
      (newOrder) => {
        this.setData({
          order: newOrder,
        });
        const orderStatusName = getOrderStatusName(newOrder);
        this.setData({
          ["order.orderStatusName"]: orderStatusName,
        });
        return newOrder;
      }
    ).then(
      (newOrder) => {
        return getPhotosPromise(newOrder, this.setPhotoOk);
      }
    ).then(
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

  }
})