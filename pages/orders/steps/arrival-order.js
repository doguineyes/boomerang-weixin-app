// pages/orders/steps/arrival-order.js
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
    deletedOriginPackages: [],
  },

  onPackageCargoNameChange: function(event) {
    const [packageIndex, cargoIndex] = event.target.id.split(",");
    const name = event.detail;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}].etkCargoRecords[${cargoIndex}].name`]: name,
      [`order.etkPackages[${packageIndex}].etkCargoRecords[${cargoIndex}].errorMessage`]: "",
    });
  },

  onPackageCargoCountChange: function(event) {
    const [packageIndex, cargoIndex] = event.target.id.split(",");
    const count = event.detail;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}].etkCargoRecords[${cargoIndex}].count`]: count,
    });
  },

  onAddCargoField: function(event) {
    const packageIndex = event.target.id;
    const lastIndex = this.data.order.etkPackages[packageIndex].etkCargoRecords.length;
    if (lastIndex >= 5) {
      Dialog
      .alert({message: "添加的货物过多"})
      .then(() => {});
      return;
    }
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}].etkCargoRecords[${lastIndex}]`]: {name: "", count: 1,},
    });
  },

  onDeletePackageCargoRecord: function(event) {
    const { instance } = event.detail;
    const [ packageIndex, cargoIndex ] = event.target.id.split(",");
    if (this.data.order.etkPackages[packageIndex].etkCargoRecords.length <= 1) {
      Dialog
      .alert({message: "至少有一个货物"})
      .then(() => {
      });
      instance.close();
      return;
    }
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.data.order.etkPackages[packageIndex].etkCargoRecords.splice(cargoIndex, 1);
    this.setData({
      [`order.etkPackages[${packageIndex}].etkCargoRecords`]: this.data.order.etkPackages[packageIndex].etkCargoRecords,
    });
  },

  onPackageWeightChange: function(event) {
    const packageIndex = event.target.id;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}]feeList.weightInKilograms`]: event.detail,
      [`order.etkPackages[${packageIndex}]feeList.weightErrorMessage`]: "",
    });
  },

  onPackagePackagingFeeChange: function(event) {
    const packageIndex = event.target.id;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}]feeList.packingFeeInYuan`]: event.detail,
      [`order.etkPackages[${packageIndex}]feeList.packingFeeInCent`]: event.detail * 100,
    });
    this.calculateTotalFee();
  },

  onPackageExpressFeeChange: function(event) {
    const packageIndex = event.target.id;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}]feeList.expressFeeInYuan`]: event.detail,
      [`order.etkPackages[${packageIndex}]feeList.expressFeeInCent`]: event.detail * 100,
    });
    this.calculateTotalFee();
  },

  onPackageTaxesChange: function(event) {
    const packageIndex = event.target.id;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}]feeList.taxesInYuan`]: event.detail,
      [`order.etkPackages[${packageIndex}]feeList.taxesInCent`]: event.detail * 100,
    });
    this.calculateTotalFee();
  },

  onPackageInsuranceChange: function(event) {
    const value = event.detail < 0 ? 0 : event.detail;
    const packageIndex = event.target.id;
    if (this.data.order.etkPackages[packageIndex].status === "origin") {
      this.setData({
        [`order.etkPackages[${packageIndex}].status`]: "modified",
      });
    }
    this.setData({
      [`order.etkPackages[${packageIndex}]feeList.insuranceInYuan`]: value,
      [`order.etkPackages[${packageIndex}]feeList.insuranceInCent`]: value * 100,
    });
    this.calculateTotalFee();
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

  onAddPackage: function() {
    const lastIndex = this.data.order.etkPackages.length;
    if (lastIndex >= 5) {
      Dialog
      .alert({message: "包裹数量过多"})
      .then(() => {});
      return;
    }
    this.setData({
      [`order.etkPackages[${lastIndex}]`]: {
        etkCargoRecords:[{name: "", count: 1,},],
        feeList: {},
        status: "new",
      }
    });
    this.calculateTotalFee();
  },

  onDeletePackage(event) {
    const { instance } = event.detail;
    if (this.data.order.etkPackages.length === 1) {
      Dialog
      .alert({message: "至少有一个包裹"})
      .then(
        () => {}
      );
      instance.close();
      return;
    }
    const packageIndex = event.target.id;
    Dialog.confirm({
      title: "删除包裹",
      message: `是否删除包裹${(Number.parseInt(packageIndex) + 1)}`,
    })
    .then(() => {
      // on confirm
      instance.close();
      const [ deletedPackage ] = this.data.order.etkPackages.splice(packageIndex, 1);
      if (deletedPackage.status == "origin" || deletedPackage.status == "modified") {
        this.data.deletedOriginPackages.push(deletedPackage);
      }
      this.setData({
        ["order.etkPackages"]: this.data.order.etkPackages,
      });
      this.calculateTotalFee();
      return;
    })
    .catch(() => {
      // on cancel
      instance.close();
      return;
    });
  },

  checkPackagePriceOk() {
    const order = this.data.order;
    let somethingError = false;
    if (!order.etkPackages || order.etkPackages.length === 0) {
      const emptyPackages = [
        {
          etkCargoRecords:[{
            name: "", 
            count: 1,
          },],
        },
      ];
      this.setData({
        ["order.etkPackages"]: emptyPackages,
      });
      somethingError = true;
    }
    for (let [packageIndex, etkPackage] of order.etkPackages.entries()) {
      if (!etkPackage.etkCargoRecords || etkPackage.etkCargoRecords.length === 0) {
        const emptyCargoRecords = [{
          name: "", 
          count: 1,
        }];
        this.setData({
          [`order.etkPackages[${packageIndex}].etkCargoRecords`]: emptyCargoRecords,
        });
        somethingError = true;
      }
      for (let [cargoIndex, cargo] of etkPackage.etkCargoRecords.entries()) {
        if (!cargo.name) {
          this.setData({
            [`order.etkPackages[${packageIndex}].etkCargoRecords[${cargoIndex}].errorMessage`]: "物品名不得为空",
          });
          somethingError = true;
        }
      }

      if (!etkPackage.feeList) {
        this.setData({
          [`order.etkPackages[${packageIndex}].feeList.weightErrorMessage`]: "重量不得小于等于0",
          [`order.etkPackages[${packageIndex}].feeList.feesErrorMessage`]: "费用不得为0",
        });
        somethingError = true;
      } else {
        if (!etkPackage.feeList.weightInKilograms || etkPackage.feeList.weightInKilograms <= 0.0) {
          this.setData({
            [`order.etkPackages[${packageIndex}].feeList.weightErrorMessage`]: "重量不得小于等于0",
          });
          somethingError = true;
        }
        if (etkPackage.feeList.packageTotalCostInCent <= 0) {
          this.setData({
            [`order.etkPackages[${packageIndex}].feeList.feesErrorMessage`]: "费用不得为0",
          });
          somethingError = true;
        }
      }
    }

    if (!this.data.order.totalCostInCent || this.data.order.totalCostInCent <= 0) {
      this.setData({
        ["order.totalCostInCentErrorMessage"]: "订单总价不得为0",
      });
      somethingError = true;
    }

    return !somethingError;
  },

  savePackageInfoPromise() {
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = this.data.order.id;
    this.data.deletedOriginPackages = this.data.deletedOriginPackages
    .concat(this.data.order.etkPackages.filter((etkPackage) => etkPackage.status === "modified"));
    const tasks = [];
    for (let needDeletePackage of this.data.deletedOriginPackages) {
      const deletePackageTask = new Promise(
        (resolve, reject) => {
          wx.request({
            url: `${baseUrl}/orders/${orderId}/etk-packages/${needDeletePackage.id}`,
            method: "DELETE",
            header: {
              "content-type": "application/json",
              "Authorization": token
            },
            success: (res) => {
              if (res.statusCode != 200) {
                reject(response);
              }
              resolve(res);
            },
            fail: (err) => {
              reject(err);
            }
          });
        }
      );
      tasks.push(deletePackageTask);
    }

    const needAddPackagesRequest = {
      etkPackages: this.data.order.etkPackages.filter((etkPackage) => etkPackage.status != "origin"),
    }
    if (needAddPackagesRequest.etkPackages && needAddPackagesRequest.etkPackages.length != 0) {
      const addPackagesTask = new Promise(
        (resolve, reject) => {
          wx.request({
            url: `${baseUrl}/orders/${orderId}/etk-packages/`,
            method: "POST",
            data: needAddPackagesRequest,
            header: {
              "content-type": "application/json",
              "Authorization": token
            },
            success: (response) => {
              if (response.statusCode != 200) {
                reject(response);
              }
              const order = response.data;
              resolve(order);
            },
            fail: (err) => {
              reject(err);
            },
          });
        });
      tasks.push(addPackagesTask);
    }

    return Promise.all(tasks)
    .then(
      () => {
        return this.data.order;
      }
    );
  },

  notifyPayPromise(order) {
    const token = "Bearer " + app.globalData.token;
    const baseUrl = app.globalData.baseUrl;
    const orderId = order.id;
    return new Promise(
      (resolve, reject) => {
        wx.request({
          url: `${baseUrl}/orders/${orderId}/notify-pay`,
          method: "GET",
          header: {
            "content-type": "application/json",
            "Authorization": token
          },
          success: function(res) {
            if (res.statusCode != 200) {
              reject(res);
            }
            resolve(res);
          },
          fail: function(err) {
            reject(err);
          }
        });
      }
    );
  },

  onSavePackagingAndFeeButNotNotice: function() {
    if (!this.checkPackagePriceOk()) {
      Dialog
      .alert({message: "订单打包和计价信息存在错误，请修改后再提交"})
      .then(
        () => {
        }
      );
      return;
    }
    Toast.loading({
      mask: true,
      message: '处理中...'
    });
    this.savePackageInfoPromise()
    .then(
      () => {
        Toast.clear();
        wx.switchTab({
          url: '../orders',
        });
      }
    );
  },

  onSaveAndNoticePayment: function() {
    if (!this.checkPackagePriceOk()) {
      Dialog
      .alert({message: "订单打包和计价信息存在错误，请修改后再提交"})
      .then(
        () => {
        }
      );
      return;
    }
    Dialog.confirm({
      title: "是否通知客户支付",
      message: "提交后将不能修改打包和价格信息，并将通知客户支付，是否提交？",
    })
    .then(
      () => {
        Toast.loading({
          mask: true,
          message: '处理中...'
        });
        this.savePackageInfoPromise()
        .then(
          (order) => {
            return this.notifyPayPromise(order);
          }
        )
        .then(
          () => {
            Toast.clear();
            wx.switchTab({
              url: '../orders',
            });
          }
        );
      }
    )
    .catch(
      () => {
        Dialog
        .alert({message: "未保存和提交"})
        .then(
          () => {}
        );
        return;
      }
    );
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
        etkCargoRecords:[{name: "", count: 1,},],
        feeList: {},
        status: "new",
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
          [`order.etkPackages[${packageIndex}].status`]: "origin",
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
    const tasks = getOrder(id, this.setOrder, this.setIdCardPhoto, this.setArrivalPhoto);

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

  }
})