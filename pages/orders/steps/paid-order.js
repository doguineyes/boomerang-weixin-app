// pages/orders/steps/paid-order.js
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
    
  },

  onEtkNumberChange: function(event) {
    this.setData({
      ["order.etkNumber"]: event.detail,
    });
  },

  onSave: function() {
    if (!this.data.order.etkNumber) {
      Dialog.confirm({
        message: "请填写ETK快递号码",
      });
      return;
    }
    this.setData({
      submitting: true,
    });
    const self = this;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    const etkNumber = this.data.order.etkNumber;
    const setEtkNumberUrl = `${baseUrl}/orders/${orderId}/etk/${etkNumber}`;
    new Promise((resolve, reject) => {
      wx.request({
        url: setEtkNumberUrl,
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
    })
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