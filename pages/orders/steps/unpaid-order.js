// pages/orders/steps/unpaid-order.js
import Toast from "@vant/weapp/toast/toast";
import {getOrder} from "../orderHelper.js";
import {getOrderStatusName} from "../orderStatus.js";

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  },

  setArrivalPhoto: function(photoIndex, localUrl) {
    this.setData({
      [`order.arrivalPhotos[${photoIndex}].url`]: localUrl,
      [`order.arrivalPhotos[${photoIndex}].status`]: "done",
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
    if (this.data.order.arrivalPhotos) {
      for (let photoIndex = 0; photoIndex < this.data.order.arrivalPhotos.length; photoIndex++) {
        const originalUrl = this.data.order.arrivalPhotos[photoIndex].url;
        this.setData({
          [`order.arrivalPhotos[${photoIndex}].originalUrl`]: originalUrl,
          [`order.arrivalPhotos[${photoIndex}].status`]: "uploading",
          [`order.arrivalPhotos[${photoIndex}].isImage`]: true,
        });
      }
    }
    if (!this.data.order.etkPackages || this.data.order.etkPackages.length === 0) {
      const emptyPackages = [{
        etkCargoRecords:[{name: "", count: 1,},
        ],
      }];
      this.setData({
        ["order.etkPackages"]: emptyPackages,
      })
    } else {
      for (let [packageIndex, etkPackage] of this.data.order.etkPackages.entries()) {
        let feeList = etkPackage.feeList;
        this.setData({
          [`order.etkPackages[${packageIndex}].feeList.packingFeeInYuan`]: feeList.packingFeeInCent ? feeList.packingFeeInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.expressFeeInYuan`]: feeList.expressFeeInCent ? feeList.expressFeeInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.taxesInYuan`]: feeList.taxesInCent ? feeList.taxesInCent / 100 : 0.0,
          [`order.etkPackages[${packageIndex}].feeList.insuranceInYuan`]: feeList.insuranceInCent ? feeList.insuranceInCent / 100 : 0.0,
        });
      }
      this.calculateTotalFee();
    }
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

  calculateTotalFee() {
    let sumInCent = 0;
    for (let [packageIndex, etkPackage] of this.data.order.etkPackages.entries()) {
      const feeList = etkPackage.feeList;
      if (!feeList) {
        continue;
      }
      const packageTotalCostInCent = (feeList.packingFeeInCent ? feeList.packingFeeInCent : 0) + 
      (feeList.expressFeeInCent ? feeList.expressFeeInCent : 0) +
      (feeList.taxesInCent ? feeList.taxesInCent : 0) + 
      (feeList.insuranceInCent ? feeList.insuranceInCent : 0);
      this.setData({
        [`order.etkPackages[${packageIndex}].feeList.packageTotalCostInCent`]: Math.floor(packageTotalCostInCent),
        [`order.etkPackages[${packageIndex}].feeList.packageTotalCostInYuan`]: Math.floor(packageTotalCostInCent) / 100,
        [`order.etkPackages[${packageIndex}].feeList.feesErrorMessage`]: "",
      });
      sumInCent += packageTotalCostInCent;
    }
    this.setData({
      ["order.totalCostInYuan"]: Math.floor(sumInCent) / 100.0,
      ["order.totalCostInCent"]: Math.floor(sumInCent),
      ["order.totalCostInCentErrorMessage"]: "",
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
    this.setData({
      loginUsername: app.globalData.username,
    });
    const id = options.orderId;
    this.setData({
      ["order.id"]: id,
    });
    const tasks = getOrder(id, this.setOrder, this.setIdCardPhoto, this.setArrivalPhoto);

    Promise.all(tasks)
    .then(
      () => {
        Toast.success("加载完成");
      }
    );
  },

  onPay: function() {
    this.setData({
      submitting: true,
    });
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
      Toast.success("支付成功");
      this.setData({
        submitting: false,
      });
      wx.switchTab({
        url: "../orders"
      });
    }).catch(
      () => {
        Toast.fail("支付失败");
        this.setData({
          submitting: false,
        });
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