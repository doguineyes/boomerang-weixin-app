// pages/orders/steps/unpaid-order.js
import Toast from "@vant/weapp/toast/toast";
import {getOrderPromise, getPhotosPromise} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: {},
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

  onPay: function(event) {
    const id = this.data.order.id;
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderUrl = baseUrl + `/orders/${id}`;

    let getPrepayIdTask = new Promise((resolve, reject) => {
      wx.request({
        url: orderUrl + "/prepay-info",
        method: "GET",
        header: {
          "content-type": "application/json",
          "Authorization": token
        },
        success: function(res) {
          if (res.statusCode !== 200) {
            reject(res);
          }
          const prepayInfo = res.data;
          resolve(prepayInfo);
        },
        fail(err) {
          reject(err);
        },
      });
    });

    getPrepayIdTask.then((prepayInfo) => {
      return new Promise((resolve, reject) => {
        wx.requestPayment({
          nonceStr: prepayInfo.nonceStr,
          package: prepayInfo.package,
          paySign: prepayInfo.paySign,
          timeStamp: prepayInfo.timeStamp,
          signType: prepayInfo.signType,
          success: function(res) {
            resolve(res);
          },
          fail: function(err) {
            reject(err);
          },
        });
      });
    }).then(() => {
      //TODO 需要新增支付信息，并且把支付信息提交出去
      wx.redirectTo({
        url: "../orders",
      });
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